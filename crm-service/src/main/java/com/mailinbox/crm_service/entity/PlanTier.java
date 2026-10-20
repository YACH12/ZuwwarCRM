package com.mailinbox.crm_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "plan_tier")
public class PlanTier {

    @Id
    private String id;                    // "free-tier", "demo-tier", "premium-tier"

    @Column(nullable = false, unique = true)
    private String code;                  // "FREE", "DEMO", "PREMIUM"

    @Column(nullable = false)
    private String nom;                   // "Gratuit", "Démo", "Premium"

    @Column(nullable = false)
    private String description;           // Description courte

    // ── Tarification ──────────────────────────────────────────────────────────
    @Column(nullable = false)
    private double prixMensuel;           // 0, 29, 99

    @Column(nullable = false)
    private double prixAnnuel;            // 0, 290, 990 (10% réduction)

    // ── Limites ───────────────────────────────────────────────────────────────
    @Column(nullable = false)
    private int maxEmails;                // Emails max par mois

    @Column(nullable = false)
    private int maxContacts;              // Contacts max

    @Column(nullable = false)
    private int maxUsers;                 // Utilisateurs max

    @Column(nullable = false)
    private int maxCampagnes;             // Campagnes max par mois

    @Column(nullable = false, columnDefinition = "integer not null default 0")
    private int maxEmailsImap;             // Emails reçus (IMAP) max — 0=pas d'accès, cf. smtpPersonnalise

    @Column(nullable = false)
    private int emailsParSeconde;         // Débit SMTP

    // ── Essai ─────────────────────────────────────────────────────────────────
    @Column(nullable = false)
    private int dureeEssaiJours;          // 0=FREE, 14=DEMO, 30=PREMIUM

    // ── Fonctionnalités ───────────────────────────────────────────────────────
    @Column(nullable = false)
    private boolean smtpPersonnalise;     // SMTP personnalisé

    @Column(nullable = false)
    private boolean supportPrioritaire;   // Support prioritaire

    @Column(nullable = false)
    private boolean apiAccess;            // Accès API REST

    @Column(nullable = false)
    private boolean leadScoringIA;        // Accès Lead Scoring IA

    @Column(nullable = false)
    private boolean nlpClassification;    // Accès NLP Classification

    @Column(nullable = false, columnDefinition = "boolean not null default false")
    private boolean chatbotAccess;        // Accès Chatbot IA (DEMO/PREMIUM uniquement)

    @Column(nullable = false)
    private boolean exportCSV;            // Export CSV contacts

    // ── Affichage ─────────────────────────────────────────────────────────────
    @Column(nullable = false)
    private String couleur;               // "#6B7280", "#3B82F6", "#7C3AED"

    @Column(nullable = false)
    private String icone;                 

    @Column(nullable = false)
    private boolean populaire = false;    // Badge "Populaire"

    @Column(nullable = false)
    private int ordre = 0;               // Ordre d'affichage sur la landing

    // ── Statut ────────────────────────────────────────────────────────────────
    @Column(nullable = false)
    private boolean actif = true;

    // ── Dates ─────────────────────────────────────────────────────────────────
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}