package com.mailinbox.crm_service.service;

import com.mailinbox.crm_service.entity.Imap;
import com.mailinbox.crm_service.entity.IncomingEmail;
import com.mailinbox.crm_service.exception.NotFoundException;
import com.mailinbox.crm_service.exception.ValidationException;
import com.mailinbox.crm_service.repository.ImapRepository;
import com.mailinbox.crm_service.security.CurrentPrincipal;
import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImapService {

    private final ImapRepository imapRepository;
    private final EncryptionService encryptionService;
    private final IncomingEmailService incomingEmailService;

    // Fallback plateforme : même compte Gmail que le SMTP (voir EmailService), utilisé pour le
    // polling IMAP tant qu'aucune config Imap explicite (client_id NULL, active) n'existe en DB.
    @Value("${smtp.gmail.username:}")
    private String envUsername;

    @Value("${smtp.gmail.password:}")
    private String envPassword;

    private static final String ENV_FALLBACK_HOST = "imap.gmail.com";
    private static final int ENV_FALLBACK_PORT = 993;

    public Page<Imap> getAllImaps(Pageable pageable, CurrentPrincipal principal) {
        if (principal.isClient()) {
            return imapRepository.findByClientId(principal.client().getId(), pageable);
        }
        return imapRepository.findAll(pageable);
    }

    public Imap getImapById(Long id, CurrentPrincipal principal) {
        Imap imap = fetchOrThrow(id);
        assertVisible(imap, principal);
        return imap;
    }

    private Imap fetchOrThrow(Long id) {
        return imapRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Imap non trouvée : " + id));
    }

    // Un Client ne voit JAMAIS l'IMAP plateforme (client_id NULL), même en lecture
    private void assertVisible(Imap imap, CurrentPrincipal principal) {
        if (principal.isClient()
                && (imap.getClientId() == null || !imap.getClientId().equals(principal.client().getId()))) {
            throw new NotFoundException("Imap non trouvée : " + imap.getId());
        }
    }

    public Imap createImap(Imap imap, CurrentPrincipal principal) {
        if (principal.isClient()) {
            assertImapPersonnaliseAutorise(principal);
            imap.setClientId(principal.client().getId());
        }
        imap.setPassword(encryptionService.encrypt(imap.getPassword()));
        return imapRepository.save(imap);
    }

    // Même flag que le SMTP personnalisé (smtpPersonnalise) : un compte mail personnalisé
    // couvre l'envoi et la réception, donc la même permission de plan s'applique aux deux.
    private void assertImapPersonnaliseAutorise(CurrentPrincipal principal) {
        if (!principal.client().getPlanTier().isSmtpPersonnalise()) {
            throw new ValidationException(
                    "L'IMAP personnalisé n'est pas disponible dans le plan "
                            + principal.client().getPlanTier().getCode()
                            + " — Passez au plan supérieur");
        }
    }

    public Imap updateImap(Long id, Imap request, CurrentPrincipal principal) {
        Imap imap = fetchOrThrow(id);
        assertVisible(imap, principal);
        imap.setHost(request.getHost());
        imap.setPort(request.getPort());
        imap.setUsername(request.getUsername());
        imap.setPassword(encryptionService.encrypt(request.getPassword()));
        imap.setActive(request.isActive());
        return imapRepository.save(imap);
    }

    // Désactive uniquement les autres IMAP du même périmètre (même tenant, ou plateforme) avant d'activer celui ciblé
    public Imap activateImap(Long id, CurrentPrincipal principal) {
        Imap target = fetchOrThrow(id);
        assertVisible(target, principal);

        Long scopeClientId = target.getClientId();
        var memeScope = scopeClientId == null
                ? imapRepository.findByClientIdIsNull()
                : imapRepository.findByClientId(scopeClientId);
        memeScope.forEach(i -> {
            i.setActive(false);
            imapRepository.save(i);
        });

        target.setActive(true);
        return imapRepository.save(target);
    }

    public boolean testImapConnection(Long id, CurrentPrincipal principal) {
        Imap imap = fetchOrThrow(id);
        assertVisible(imap, principal);
        Store store = null;
        try {
            store = connect(imap.getHost(), imap.getPort(), imap.getUsername(), encryptionService.decrypt(imap.getPassword()));
            return store.isConnected();
        } catch (Exception e) {
            log.warn("Échec test connexion IMAP {} : {}", imap.getHost(), e.getMessage());
            return false;
        } finally {
            fermerSansErreur(store);
        }
    }

    public void deleteImap(Long id, CurrentPrincipal principal) {
        Imap imap = fetchOrThrow(id);
        assertVisible(imap, principal);
        imapRepository.delete(imap);
    }

    private Store connect(String host, int port, String username, String plainPassword) throws MessagingException {
        Properties props = new Properties();
        props.put("mail.store.protocol", "imaps");
        props.put("mail.imaps.host", host);
        props.put("mail.imaps.port", port);
        props.put("mail.imaps.ssl.enable", "true");
        props.put("mail.imaps.connectiontimeout", "10000");
        props.put("mail.imaps.timeout", "10000");

        Session session = Session.getInstance(props);
        Store store = session.getStore("imaps");
        store.connect(host, username.trim(), plainPassword.trim().replace(" ", ""));
        return store;
    }

    // Poll les boîtes IMAP actives toutes les 60s, récupère les nouveaux messages (par UID,
    // indépendamment du flag \Seen) et les fait passer par le pipeline existant (liaison
    // contact + classification NLP best-effort).
    @Scheduled(fixedDelay = 60000)
    public void fetchAndProcessNewEmails() {
        for (Imap imap : resolveImapsToPoll()) {
            try {
                pollInbox(imap);
            } catch (Exception e) {
                log.warn("Échec du polling IMAP pour {} (client {}) : {}",
                        imap.getUsername(), imap.getClientId(), e.getMessage());
            }
        }
    }

    // Boîtes explicitement configurées en DB, plus le fallback plateforme (compte Gmail du
    // .env déjà utilisé pour le SMTP), persisté en DB dès le premier poll pour permettre le
    // suivi du dernier UID traité.
    private List<Imap> resolveImapsToPoll() {
        List<Imap> actifs = new ArrayList<>(imapRepository.findByActiveTrue());

        boolean plateformeDejaConfiguree = actifs.stream().anyMatch(i -> i.getClientId() == null);
        if (!plateformeDejaConfiguree && !envUsername.isBlank() && !envPassword.isBlank()) {
            Imap fallback = new Imap();
            fallback.setHost(ENV_FALLBACK_HOST);
            fallback.setPort(ENV_FALLBACK_PORT);
            fallback.setUsername(envUsername.trim());
            fallback.setPassword(encryptionService.encrypt(envPassword.trim()));
            fallback.setActive(true);
            actifs.add(imapRepository.save(fallback));
        }
        return actifs;
    }

    private void pollInbox(Imap imap) throws MessagingException {
        Store store = connect(imap.getHost(), imap.getPort(), imap.getUsername(), encryptionService.decrypt(imap.getPassword()));
        try {
            Folder folder = store.getFolder("INBOX");
            folder.open(Folder.READ_ONLY);
            try {
                UIDFolder uidFolder = (UIDFolder) folder;

                // Première fois qu'on poll cette boîte : on démarre le suivi à partir de
                // maintenant plutôt que de réimporter tout l'historique de la boîte.
                long dernierUidConnu = imap.getLastUid() != null ? imap.getLastUid() : uidFolder.getUIDNext() - 1;

                Message[] nouveaux = uidFolder.getMessagesByUID(dernierUidConnu + 1, UIDFolder.LASTUID);
                long maxUidTraite = dernierUidConnu;

                for (Message message : nouveaux) {
                    long uid = uidFolder.getUID(message);
                    if (uid <= dernierUidConnu) continue;
                    try {
                        IncomingEmail email = new IncomingEmail();
                        email.setClientId(imap.getClientId());
                        email.setExpediteur(extraireExpediteur(message));
                        email.setSujet(message.getSubject());
                        email.setCorps(extraireCorps(message));
                        incomingEmailService.recevoirEmail(email, CurrentPrincipal.staff(null));
                    } catch (Exception e) {
                        log.warn("Échec traitement d'un message IMAP ({}) : {}", imap.getUsername(), e.getMessage());
                    }
                    if (uid > maxUidTraite) maxUidTraite = uid;
                }

                if (imap.getLastUid() == null || maxUidTraite != imap.getLastUid()) {
                    imap.setLastUid(maxUidTraite);
                    imapRepository.save(imap);
                }
            } finally {
                folder.close(false);
            }
        } finally {
            fermerSansErreur(store);
        }
    }

    private void fermerSansErreur(Store store) {
        if (store == null) {
            return;
        }
        try {
            store.close();
        } catch (MessagingException e) {
            log.debug("Erreur fermeture connexion IMAP : {}", e.getMessage());
        }
    }

    private String extraireExpediteur(Message message) throws MessagingException {
        Address[] from = message.getFrom();
        if (from == null || from.length == 0) {
            return "inconnu";
        }
        return from[0] instanceof InternetAddress addr ? addr.getAddress() : from[0].toString();
    }

    private String extraireCorps(Message message) throws MessagingException, IOException {
        Object content = message.getContent();
        if (content instanceof String s) {
            return s;
        }
        if (content instanceof Multipart multipart) {
            return extraireCorpsMultipart(multipart);
        }
        return "";
    }

    private String extraireCorpsMultipart(Multipart multipart) throws MessagingException, IOException {
        String texteHtml = null;
        for (int i = 0; i < multipart.getCount(); i++) {
            BodyPart part = multipart.getBodyPart(i);
            if (part.isMimeType("text/plain")) {
                return (String) part.getContent();
            }
            if (part.isMimeType("text/html") && texteHtml == null) {
                texteHtml = (String) part.getContent();
            } else if (part.getContent() instanceof Multipart nested) {
                String trouve = extraireCorpsMultipart(nested);
                if (!trouve.isBlank()) {
                    return trouve;
                }
            }
        }
        return texteHtml != null ? texteHtml : "";
    }
}
