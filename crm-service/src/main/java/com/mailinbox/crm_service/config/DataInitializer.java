package com.mailinbox.crm_service.config;

import com.mailinbox.crm_service.entity.PlanTier;
import com.mailinbox.crm_service.entity.User;
import com.mailinbox.crm_service.enums.UserRole;
import com.mailinbox.crm_service.repository.PlanTierRepository;
import com.mailinbox.crm_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final PlanTierRepository planTierRepository;
    private final UserRepository userRepository;

    @Value("${BOOTSTRAP_ADMIN_KEYCLOAK_ID:}")
    private String bootstrapAdminKeycloakId;

    @Value("${BOOTSTRAP_ADMIN_EMAIL:admin@zuwwar.local}")
    private String bootstrapAdminEmail;

    @Value("${BOOTSTRAP_ADMIN_NOM:Admin}")
    private String bootstrapAdminNom;

    @Value("${BOOTSTRAP_ADMIN_PRENOM:Bootstrap}")
    private String bootstrapAdminPrenom;

    @Override
    public void run(String... args) {

        if (planTierRepository.count() > 0) {
            System.out.println("Plans déjà initialisés — rien à faire");
            synchroniserAccesChatbot();
            synchroniserQuotaEmailsImap();
        } else {
            initialiserPlans();
        }

        initialiserAdminBootstrap();
    }

    private void initialiserPlans() {

        // ── FREE ──────────────────────────────────────────────────────────────
        PlanTier free = new PlanTier();
        free.setId("free-tier");
        free.setCode("FREE");
        free.setNom("Gratuit");
        free.setDescription("Idéal pour démarrer");
        free.setPrixMensuel(0);
        free.setPrixAnnuel(0);
        free.setMaxEmails(500);
        free.setMaxContacts(100);
        free.setMaxUsers(1);
        free.setMaxCampagnes(2);
        free.setMaxEmailsImap(0);
        free.setEmailsParSeconde(1);
        free.setDureeEssaiJours(0);
        free.setSmtpPersonnalise(false);
        free.setSupportPrioritaire(false);
        free.setApiAccess(false);
        free.setLeadScoringIA(false);
        free.setNlpClassification(false);
        free.setChatbotAccess(false);
        free.setExportCSV(false);
        free.setCouleur("#6B7280");
        free.setIcone("🌱");
        free.setPopulaire(false);
        free.setOrdre(1);
        free.setActif(true);
        planTierRepository.save(free);

        // ── DEMO ──────────────────────────────────────────────────────────────
        PlanTier demo = new PlanTier();
        demo.setId("demo-tier");
        demo.setCode("DEMO");
        demo.setNom("Démo");
        demo.setDescription("Essai complet 14 jours");
        demo.setPrixMensuel(29);
        demo.setPrixAnnuel(290);
        demo.setMaxEmails(5000);
        demo.setMaxContacts(1000);
        demo.setMaxUsers(5);
        demo.setMaxCampagnes(20);
        demo.setMaxEmailsImap(100);
        demo.setEmailsParSeconde(5);
        demo.setDureeEssaiJours(14);
        demo.setSmtpPersonnalise(true);
        demo.setSupportPrioritaire(false);
        demo.setApiAccess(true);
        demo.setLeadScoringIA(true);
        demo.setNlpClassification(true);
        demo.setChatbotAccess(true);
        demo.setExportCSV(true);
        demo.setCouleur("#3B82F6");
        demo.setIcone("🚀");
        demo.setPopulaire(true);
        demo.setOrdre(2);
        demo.setActif(true);
        planTierRepository.save(demo);

        // ── PREMIUM ───────────────────────────────────────────────────────────
        PlanTier premium = new PlanTier();
        premium.setId("premium-tier");
        premium.setCode("PREMIUM");
        premium.setNom("Premium");
        premium.setDescription("Pour les équipes avancées");
        premium.setPrixMensuel(99);
        premium.setPrixAnnuel(990);
        premium.setMaxEmails(50000);
        premium.setMaxContacts(100000);
        premium.setMaxUsers(20);
        premium.setMaxCampagnes(200);
        premium.setMaxEmailsImap(100000);
        premium.setEmailsParSeconde(20);
        premium.setDureeEssaiJours(30);
        premium.setSmtpPersonnalise(true);
        premium.setSupportPrioritaire(true);
        premium.setApiAccess(true);
        premium.setLeadScoringIA(true);
        premium.setNlpClassification(true);
        premium.setChatbotAccess(true);
        premium.setExportCSV(true);
        premium.setCouleur("#7C3AED");
        premium.setIcone("⚡");
        premium.setPopulaire(false);
        premium.setOrdre(3);
        premium.setActif(true);
        planTierRepository.save(premium);

        System.out.println("✅ 3 plans créés : free-tier, demo-tier, premium-tier");
    }

    private void synchroniserAccesChatbot() {
        planTierRepository.findAll().forEach(plan -> {
            boolean accesAttendu = !"FREE".equals(plan.getCode());
            if (plan.isChatbotAccess() != accesAttendu) {
                plan.setChatbotAccess(accesAttendu);
                planTierRepository.save(plan);
                System.out.println("🔧 chatbotAccess corrigé pour " + plan.getCode() + " -> " + accesAttendu);
            }
        });
    }

  
    private void synchroniserQuotaEmailsImap() {
        planTierRepository.findAll().forEach(plan -> {
            int quotaAttendu = switch (plan.getCode()) {
                case "DEMO" -> 100;
                case "PREMIUM" -> 100000;
                default -> 0;
            };
            if (plan.getMaxEmailsImap() != quotaAttendu) {
                plan.setMaxEmailsImap(quotaAttendu);
                planTierRepository.save(plan);
                System.out.println("🔧 maxEmailsImap corrigé pour " + plan.getCode() + " -> " + quotaAttendu);
            }
        });
    }

 
    private void initialiserAdminBootstrap() {
        if (bootstrapAdminKeycloakId == null || bootstrapAdminKeycloakId.isBlank()) {
            return;
        }

        if (userRepository.findByIDkeyclock(bootstrapAdminKeycloakId).isPresent()) {
            System.out.println("Admin bootstrap déjà lié — rien à faire");
            return;
        }

        if (userRepository.existsByEmail(bootstrapAdminEmail)) {
            System.out.println("Un utilisateur existe déjà avec l'email " + bootstrapAdminEmail
                    + " mais un autre keycloak_id — vérifie BOOTSTRAP_ADMIN_KEYCLOAK_ID");
            return;
        }

        User admin = User.builder()
                .email(bootstrapAdminEmail)
                .nom(bootstrapAdminNom)
                .prenom(bootstrapAdminPrenom)
                .role(UserRole.Admin)
                .IDkeyclock(bootstrapAdminKeycloakId)
                .enabled(true)
                .build();

        userRepository.save(admin);
        System.out.println("Admin bootstrap créé pour keycloak_id=" + bootstrapAdminKeycloakId);
    }
}