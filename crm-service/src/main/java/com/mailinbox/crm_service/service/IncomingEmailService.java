package com.mailinbox.crm_service.service;

import com.mailinbox.crm_service.entity.Client;
import com.mailinbox.crm_service.entity.Contact;
import com.mailinbox.crm_service.entity.IncomingEmail;
import com.mailinbox.crm_service.exception.NotFoundException;
import com.mailinbox.crm_service.exception.ValidationException;
import com.mailinbox.crm_service.repository.ClientRepository;
import com.mailinbox.crm_service.repository.ContactRepository;
import com.mailinbox.crm_service.repository.IncomingEmailRepository;
import com.mailinbox.crm_service.security.CurrentPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class IncomingEmailService {

    private final IncomingEmailRepository incomingEmailRepository;
    private final ContactRepository contactRepository;
    private final ClientRepository clientRepository;
    private final AiServiceClient aiServiceClient;

    @Transactional(readOnly = true)
    public Page<IncomingEmail> getAllEmails(Pageable pageable, CurrentPrincipal principal) {
        if (principal.isClient()) {
            return incomingEmailRepository.findAllByClientId(principal.client().getId(), pageable);
        }
        return incomingEmailRepository.findAllGlobal(pageable);
    }

    @Transactional(readOnly = true)
    public IncomingEmail getEmailById(Long id, CurrentPrincipal principal) {
        IncomingEmail email = fetchOrThrow(id);
        assertVisible(email, principal);
        return email;
    }

    private IncomingEmail fetchOrThrow(Long id) {
        return incomingEmailRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Email non trouvé : " + id));
    }

    // 404 générique (pas 403) pour ne pas révéler l'existence d'une ressource chez un autre tenant
    private void assertVisible(IncomingEmail email, CurrentPrincipal principal) {
        if (principal.isClient()
                && (email.getClientId() == null || !email.getClientId().equals(principal.client().getId()))) {
            throw new NotFoundException("Email non trouvé : " + email.getId());
        }
    }

    /**
     * Enregistre un email reçu, tente de le relier à un contact existant par son adresse,
     * puis le classifie automatiquement via le service NLP (mDeBERTa zero-shot).
     * La classification est best-effort : si le service IA est indisponible, l'email est
     * quand même sauvegardé, sans catégorie.
     */
    @Transactional
    public IncomingEmail recevoirEmail(IncomingEmail email, CurrentPrincipal principal) {
        Long clientId = principal.isClient() ? principal.client().getId() : email.getClientId();
        email.setClientId(clientId);

        if (clientId != null) {
            assertQuotaEmailsImapDisponible(clientId);
            contactRepository.findByEmailAndClientId(email.getExpediteur(), clientId)
                    .ifPresent(email::setContact);
        }

        try {
            String texte = email.getSujet() != null
                    ? email.getSujet() + ". " + email.getCorps()
                    : email.getCorps();
            Map<String, Object> resultat = aiServiceClient.classifierTexte(texte);
            email.setCategorie((String) resultat.get("categorie"));
            Object confiance = resultat.get("confiance");
            if (confiance instanceof Number n) {
                email.setConfianceCategorie(n.doubleValue());
            }
        } catch (Exception e) {
            log.warn("Classification NLP non appliquée à l'email de {} : {}", email.getExpediteur(), e.getMessage());
        }

        return incomingEmailRepository.save(email);
    }

    // Quota d'emails reçus (IMAP) selon le plan du tenant — FREE n'a de toute façon pas accès
    // à l'IMAP personnalisé (voir ImapService), ce garde-fou vaut surtout pour DEMO/PREMIUM.
    private void assertQuotaEmailsImapDisponible(Long clientId) {
        Client client = clientRepository.findById(clientId).orElse(null);
        if (client == null || client.getPlanTier() == null) {
            return;
        }
        int quota = client.getPlanTier().getMaxEmailsImap();
        if (incomingEmailRepository.countByClientId(clientId) >= quota) {
            throw new ValidationException(
                    "Quota d'emails reçus atteint pour le plan " + client.getPlanTier().getCode()
                            + " (" + quota + " emails) — passez au plan supérieur");
        }
    }

    // Lie rétroactivement un email déjà reçu à un contact (ex: après création d'un
    // nouveau contact depuis un expéditeur jusque-là inconnu de la boîte de messagerie).
    @Transactional
    public IncomingEmail assignContact(Long emailId, Long contactId, CurrentPrincipal principal) {
        IncomingEmail email = fetchOrThrow(emailId);
        assertVisible(email, principal);

        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new NotFoundException("Contact non trouvé : " + contactId));
        if (principal.isClient()
                && (contact.getClientId() == null || !contact.getClientId().equals(principal.client().getId()))) {
            throw new NotFoundException("Contact non trouvé : " + contactId);
        }

        email.setContact(contact);
        return incomingEmailRepository.save(email);
    }
}
