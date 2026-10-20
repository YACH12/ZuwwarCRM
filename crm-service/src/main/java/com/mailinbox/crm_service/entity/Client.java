package com.mailinbox.crm_service.entity;

import com.mailinbox.crm_service.enums.StatutClient;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(
        name = "client",
        indexes = @Index(name = "idx_client_keycloak_id", columnList = "keycloak_id")
)
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    // ── Informations personnelles ─────────────────────────────────────────────
    @NotBlank(message = "Le nom est obligatoire")
    @Column(nullable = false)
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    @Column(nullable = false)
    private String prenom;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "L'email doit être valide")
    @Column(nullable = false, unique = true)
    private String email;

    private String telephone;

    // ── Informations entreprise ───────────────────────────────────────────────
    private String nomEntreprise;
    private String secteur;
    private String pays;

    // ── Plan et abonnement ────────────────────────────────────────────────────
    @ManyToOne
    @JoinColumn(name = "plan_tier_id")
    private PlanTier planTier;

    @Column(nullable = false)
    private LocalDateTime dateInscription;

    private LocalDateTime dateExpiration;
    private LocalDateTime dateActivation;

    // ── Statut ────────────────────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutClient statut = StatutClient.PROSPECT;

    // ── Usage ─────────────────────────────────────────────────────────────────
    @Column(nullable = false)
    private int emailsEnvoyes = 0;

    @Column(nullable = false)
    private int contactsUtilises = 0;

    @Column(nullable = false)
    private int usersActifs = 0;

    // ── Score IA ──────────────────────────────────────────────────────────────
    private double scoreIA = 0.0;

    // ── Tracking comportemental ───────────────────────────────────────────────
    private double tempsPasseSite = 0;
    private int pagesVues = 0;
    private int nombreVisites = 0;

    // ── Source ────────────────────────────────────────────────────────────────
    private String source;
    private String utmSource;
    private String utmCampaign;
    private String occupation;

    // ── Keycloak ──────────────────────────────────────────────────────────────
    @Column(name = "keycloak_id")
    private String keycloakId;

    // ── Dates ─────────────────────────────────────────────────────────────────
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String tokenVerification;
    private boolean emailVerifie = false;

    @Column(columnDefinition = "TEXT")
    private String photoUrl;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        dateInscription = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public boolean isExpire() {
        if (dateExpiration == null)
            return false;
        return LocalDateTime.now().isAfter(dateExpiration);
    }
}