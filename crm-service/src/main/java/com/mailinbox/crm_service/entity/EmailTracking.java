package com.mailinbox.crm_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter @Setter
@Entity
@Table(name = "email_tracking")
public class EmailTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String token;

    @ManyToOne
    @JoinColumn(name = "campaign_id", nullable = false)
    private Campaign campaign;

    @ManyToOne
    @JoinColumn(name = "contact_id", nullable = false)
    private Contact contact;

    // Dataset : TotalVisits
    private Integer totalVisites = 0;

    // Dataset : Total Time Spent on Website
    private Integer tempsTotal = 0;

    // Dataset : Page Views Per Visit
    private Double pageVuesParVisite = 0.0;

    // Dataset : Last Activity
    private String derniereActivite;

    // Dataset : Last Notable Activity
    private String derniereActiviteNotable;

    // Dataset : Do Not Email
    private Boolean nePassEnvoyer = false;

    // Dataset : Do Not Call
    private Boolean nePassAppeler = false;

    // Tracking email
    private Boolean ouvert = false;
    private LocalDateTime ouvertAt;

    private Boolean clique = false;
    private LocalDateTime cliqueAt;
    private String urlCliquee;

    // Liste (séparée par "|") des URLs réellement présentes dans l'email envoyé pour ce
    // token — sert d'allow-list pour /api/tracking/click/{token} afin d'empêcher un appelant
    // de détourner la redirection vers une URL arbitraire (open redirect, voir H1).
    @Column(columnDefinition = "TEXT")
    private String allowedUrls;

    private Boolean desabonne = false;
    private LocalDateTime desabonneAt;

    private Boolean rebondi = false;
    private String raisonRebond;

    private String adresseIP;
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}