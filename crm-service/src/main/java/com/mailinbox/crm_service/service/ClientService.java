package com.mailinbox.crm_service.service;

import com.mailinbox.crm_service.entity.Client;
import com.mailinbox.crm_service.entity.PlanTier;
import com.mailinbox.crm_service.entity.VisitorSession;
import com.mailinbox.crm_service.enums.StatutClient;
import com.mailinbox.crm_service.event.LeadScoringEvent;
import com.mailinbox.crm_service.exception.NotFoundException;
import com.mailinbox.crm_service.exception.ValidationException;
import com.mailinbox.crm_service.kafka.KafkaProducer;
import com.mailinbox.crm_service.repository.ClientRepository;
import com.mailinbox.crm_service.repository.PlanTierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClientService {

    // Valeurs de "Last Activity" connues du modèle XGBoost (catégories d'entraînement).
    // "Website" seul n'existe PAS dans le jeu d'entraînement -> erreur 500 côté IA.
    private static final String LAST_ACTIVITY_ACTIF  = "Page Visited on Website";
    private static final String LAST_ACTIVITY_DEFAUT = "Email Opened";

    private final ClientRepository clientRepository;
    private final PlanTierRepository planTierRepository;
    private final EmailService emailService;
    private final KafkaProducer kafkaProducer;
    private final KeycloakAdminService keycloakAdminService;
    private final AiServiceClient aiServiceClient;
    private final VisitorTrackingService visitorTrackingService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public Page<Client> getAll(Pageable pageable) {
        return clientRepository.findAll(pageable);
    }

    public Client getById(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Client introuvable : " + id));
    }

    public Client getByEmail(String email) {
        return clientRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Client introuvable : " + email));
    }

    @Transactional(readOnly = true)
    public Client getClientByKeycloakId(String keycloakId) {
        return clientRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new NotFoundException("Aucun profil client lié à ce compte connecté"));
    }

    @Transactional
    public Client save(Client client) {
        return clientRepository.save(client);
    }

    public Page<Client> getByPlan(String planId, Pageable pageable) {
        return clientRepository.findByPlanTierId(planId, pageable);
    }

    public Page<Client> getByStatut(StatutClient statut, Pageable pageable) {
        return clientRepository.findByStatut(statut, pageable);
    }

    public List<PlanTier> getPlansActifs() {
        return planTierRepository.findByActifTrue();
    }

    @Transactional
    public Client inscrire(Client client, String planId, String motDePasse, String visitorId) {
        if (clientRepository.existsByEmail(client.getEmail())) {
            throw new ValidationException("Email déjà utilisé : " + client.getEmail());
        }

        PlanTier plan = planTierRepository.findById(planId)
                .orElseThrow(() -> new NotFoundException("Plan introuvable : " + planId));

        if (!plan.isActif()) {
            throw new ValidationException("Plan non disponible : " + planId);
        }

        String keycloakId = keycloakAdminService.creerUtilisateur(
                client.getEmail(), client.getPrenom(), client.getNom(), motDePasse
        );

        client.setPlanTier(plan);
        client.setStatut(plan.getDureeEssaiJours() > 0 ? StatutClient.ESSAI : StatutClient.ACTIF);
        client.setScoreIA(0.0);
        client.setEmailsEnvoyes(0);
        client.setContactsUtilises(0);
        client.setUsersActifs(1);
        client.setKeycloakId(keycloakId);
        client.setEmailVerifie(false);
        client.setTokenVerification(java.util.UUID.randomUUID().toString());
        client.setDateActivation(LocalDateTime.now());

        if (plan.getDureeEssaiJours() > 0) {
            client.setDateExpiration(LocalDateTime.now().plusDays(plan.getDureeEssaiJours()));
        }

        appliquerComportementVisiteur(client, visitorId);

        Client saved = clientRepository.save(client);
        envoyerEmailBienvenue(saved);
        envoyerEmailVerification(saved);
        publierScoringClient(saved);

        log.info("Client inscrit : {} — Plan : {} — Keycloak ID : {}",
                saved.getEmail(), plan.getCode(), keycloakId);
        return saved;
    }

    // ── Rattache le comportement (temps/visites/pages, UTM) suivi avant l'inscription ──
    private void appliquerComportementVisiteur(Client client, String visitorId) {
        VisitorSession session = visitorTrackingService.find(visitorId);
        if (session == null) {
            return;
        }
        client.setTempsPasseSite(session.getTotalTimeSpent());
        client.setPagesVues(session.getTotalPageViews());
        client.setNombreVisites(Math.max(session.getTotalVisits(), 1));
        client.setUtmSource(session.getUtmSource());
        client.setUtmCampaign(session.getUtmCampaign());
        client.setSource(deriverSource(session.getUtmSource()));
    }

    private String deriverSource(String utmSource) {
        if (utmSource == null || utmSource.isBlank()) return "Direct Traffic";
        String s = utmSource.toLowerCase();
        if (s.contains("google") || s.contains("bing") || s.contains("organic")) return "Organic Search";
        if (s.contains("referral") || s.contains("partner")) return "Referral";
        if (s.contains("api")) return "API";
        return utmSource;
    }

    @Transactional
    public Client changerPlan(Long clientId, String nouveauPlanId) {
        Client client = getById(clientId);
        PlanTier nouveauPlan = planTierRepository.findById(nouveauPlanId)
                .orElseThrow(() -> new NotFoundException("Plan introuvable : " + nouveauPlanId));

        String ancienPlan = client.getPlanTier().getCode();
        client.setPlanTier(nouveauPlan);
        client.setStatut(StatutClient.ACTIF);

        if (nouveauPlan.getDureeEssaiJours() > 0) {
            client.setDateExpiration(LocalDateTime.now().plusDays(nouveauPlan.getDureeEssaiJours()));
        } else {
            client.setDateExpiration(null);
        }

        Client updated = clientRepository.save(client);
        log.info("Plan changé : {} → {} pour {}", ancienPlan, nouveauPlan.getCode(), client.getEmail());
        return updated;
    }

    @Transactional
    public Client suspendre(Long id) {
        Client client = getById(id);
        client.setStatut(StatutClient.SUSPENDU);
        return clientRepository.save(client);
    }

    @Transactional
    public Client reactiver(Long id) {
        Client client = getById(id);
        client.setStatut(StatutClient.ACTIF);
        return clientRepository.save(client);
    }

    @Transactional
    public Client updatePhoto(Long id, String photoUrl) {
        Client client = getById(id);
        client.setPhotoUrl(photoUrl);
        return clientRepository.save(client);
    }

    @Transactional
    public void supprimer(Long id) {
        clientRepository.delete(getById(id));
    }

    public void verifierLimiteContacts(Client client) {
        if (client.getContactsUtilises() >= client.getPlanTier().getMaxContacts()) {
            throw new ValidationException(
                    "Limite de contacts atteinte (" + client.getPlanTier().getMaxContacts()
                            + ") — Passez au plan supérieur");
        }
    }

    public void verifierLimiteEmails(Client client) {
        if (client.getEmailsEnvoyes() >= client.getPlanTier().getMaxEmails()) {
            throw new ValidationException(
                    "Limite d'emails atteinte (" + client.getPlanTier().getMaxEmails()
                            + "/mois) — Passez au plan supérieur");
        }
    }

    public void verifierAccesIA(Client client) {
        if (!client.getPlanTier().isLeadScoringIA()) {
            throw new ValidationException(
                    "Le Lead Scoring IA n'est pas disponible dans le plan "
                            + client.getPlanTier().getCode()
                            + " — Passez au plan DEMO ou PREMIUM");
        }
    }

    public void verifierAccesChatbot(Client client) {
        if (!client.getPlanTier().isChatbotAccess()) {
            throw new ValidationException(
                    "Le chatbot IA n'est pas disponible dans le plan "
                            + client.getPlanTier().getCode()
                            + " — Passez au plan DEMO ou PREMIUM");
        }
    }

    public StatsClients getStats() {
        return new StatsClients(
                clientRepository.count(),
                clientRepository.countActifs(),
                clientRepository.countByPlanCode("FREE"),
                clientRepository.countByPlanCode("DEMO"),
                clientRepository.countByPlanCode("PREMIUM"));
    }

    private void envoyerEmailBienvenue(Client client) {
        try {
            String html = """
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
                        <h2 style="color:#7C3AED">Bienvenue sur Zuwwar !</h2>
                        <p>Bonjour <strong>%s %s</strong>,</p>
                        <p>Votre compte a été créé avec succès sur le plan <strong>%s</strong>.</p>
                        <p>Vous pouvez dès maintenant vous connecter avec votre email
                           et le mot de passe que vous avez choisi.</p>
                        <a href="%s"
                           style="background:linear-gradient(135deg,#7C3AED,#3B82F6);
                                  color:white;padding:14px 28px;border-radius:8px;
                                  text-decoration:none;display:inline-block;
                                  font-weight:bold;margin:20px 0">
                            Se connecter à Zuwwar
                        </a>
                        <hr>
                        <p style="color:#9CA3AF;font-size:12px">
                            Zuwwar — Plateforme CRM Intelligente
                        </p>
                    </div>
                    """.formatted(
                    client.getPrenom(),
                    client.getNom(),
                    client.getPlanTier().getNom(),
                    frontendUrl);

            emailService.envoyerEmailSimple(
                    client.getEmail(),
                    "Bienvenue sur Zuwwar — Votre compte est prêt",
                    html,
                    null); // email transactionnel plateforme — jamais via le SMTP d'un tenant

            log.info("Email de bienvenue envoyé à : {}", client.getEmail());
        } catch (Exception e) {
            log.warn("Email de bienvenue non envoyé pour {} : {}", client.getEmail(), e.getMessage());
        }
    }

    private void envoyerEmailVerification(Client client) {
        try {
            String lienVerification = frontendUrl + "/verify-email?token=" + client.getTokenVerification();
            String html = """
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
                        <h2 style="color:#7C3AED">Vérifiez votre adresse email</h2>
                        <p>Bonjour <strong>%s %s</strong>,</p>
                        <p>Merci de confirmer votre adresse email pour activer pleinement votre compte Zuwwar.</p>
                        <a href="%s"
                           style="background:linear-gradient(135deg,#7C3AED,#3B82F6);
                                  color:white;padding:14px 28px;border-radius:8px;
                                  text-decoration:none;display:inline-block;
                                  font-weight:bold;margin:20px 0">
                            Vérifier mon email
                        </a>
                        <p style="color:#9CA3AF;font-size:12px">
                            Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.
                        </p>
                        <hr>
                        <p style="color:#9CA3AF;font-size:12px">
                            Zuwwar — Plateforme CRM Intelligente
                        </p>
                    </div>
                    """.formatted(
                    client.getPrenom(),
                    client.getNom(),
                    lienVerification);

            emailService.envoyerEmailSimple(
                    client.getEmail(),
                    "Zuwwar — Confirmez votre adresse email",
                    html,
                    null); // email transactionnel plateforme — jamais via le SMTP d'un tenant

            log.info("Email de vérification envoyé à : {}", client.getEmail());
        } catch (Exception e) {
            log.warn("Email de vérification non envoyé pour {} : {}", client.getEmail(), e.getMessage());
        }
    }

    @Transactional
    public boolean verifierEmail(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        return clientRepository.findByTokenVerification(token)
                .map(client -> {
                    client.setEmailVerifie(true);
                    client.setTokenVerification(null);
                    clientRepository.save(client);
                    log.info("Email vérifié pour : {}", client.getEmail());
                    return true;
                })
                .orElse(false);
    }

    private void publierScoringClient(Client client) {
        try {
            int visites = Math.max(client.getNombreVisites(), 1);
            LeadScoringEvent event = new LeadScoringEvent();
            event.setContactId(client.getId());
            event.setEmail(client.getEmail());
            event.setTotalTimeSpent(client.getTempsPasseSite());
            event.setPageViewsPerVisit((double) client.getPagesVues() / visites);
            event.setTotalVisits((double) visites);
            event.setLeadSource(client.getSource() != null ? client.getSource() : "Direct Traffic");
            event.setLeadOrigin("Landing Page Submission");
            // CORRIGÉ : "Website" n'est pas une catégorie connue du modèle
            event.setLastActivity(client.getStatut() == StatutClient.ACTIF
                    ? LAST_ACTIVITY_ACTIF : LAST_ACTIVITY_DEFAUT);
            event.setOccupation(client.getOccupation() != null && !client.getOccupation().isBlank()
                    ? client.getOccupation() : "unknown");
            kafkaProducer.publierScoreLead(event);
        } catch (Exception e) {
            log.warn("Kafka scoring non publié pour {} : {}", client.getEmail(), e.getMessage());
        }
    }

    @Transactional
    public Client recalculerScore(Long id) {
        Client client = getById(id);
        double score = aiServiceClient.calculerScoreClient(client);
        client.setScoreIA(score);
        return clientRepository.save(client);
    }

    @Transactional
    public Map<String, Object> recalculerTousLesScores() {
        List<Client> clients = clientRepository.findAll();
        int success = 0, errors = 0;
        for (Client client : clients) {
            try {
                double score = aiServiceClient.calculerScoreClient(client);
                client.setScoreIA(score);
                clientRepository.save(client);
                success++;
            } catch (Exception e) {
                log.warn("Erreur scoring client {} : {}", client.getId(), e.getMessage());
                errors++;
            }
        }
        return Map.of("success", success, "errors", errors,
                      "message", success + " clients mis à jour, " + errors + " erreurs");
    }

    public record StatsClients(long total, long actifs, long free, long demo, long premium) {}
}