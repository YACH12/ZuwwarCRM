package com.mailinbox.crm_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Comportement d'un visiteur anonyme (landing/signup) avant son inscription,
 * identifié par un visitorId généré côté navigateur. Une fois consommé au
 * moment de l'inscription, ces totaux alimentent les champs de scoring IA
 * du Client créé (tempsPasseSite, pagesVues, nombreVisites, utmSource...).
 */
@Getter
@Setter
@Entity
@Table(name = "visitor_session")
public class VisitorSession {

    @Id
    private String visitorId;

    @Column(nullable = false)
    private double totalTimeSpent = 0;

    @Column(nullable = false)
    private int totalVisits = 0;

    @Column(nullable = false)
    private int totalPageViews = 0;

    private String utmSource;
    private String utmCampaign;

    private LocalDateTime firstSeenAt;
    private LocalDateTime lastSeenAt;

    @PrePersist
    protected void onCreate() {
        firstSeenAt = LocalDateTime.now();
        lastSeenAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastSeenAt = LocalDateTime.now();
    }
}
