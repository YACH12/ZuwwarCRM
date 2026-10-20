package com.mailinbox.crm_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter
@Entity
@Table(name = "incoming_email")
public class IncomingEmail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // null = email interne/staff, non null = tenant propriétaire
    @Column(name = "client_id")
    private Long clientId;

    // Contact expéditeur retrouvé automatiquement par email (peut rester null si inconnu)
    @ManyToOne
    @JoinColumn(name = "contact_id")
    @JsonIgnoreProperties({"emailTrackings", "entreprise"})
    private Contact contact;

    @Column(nullable = false)
    private String expediteur;

    private String sujet;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String corps;

    // Résultat de la classification NLP (voir IncomingEmailService) — reste null si le service IA est indisponible
    private String categorie;

    private Double confianceCategorie;

    @Column(updatable = false)
    private LocalDateTime receptionAt;

    @PrePersist
    protected void onCreate() {
        receptionAt = LocalDateTime.now();
    }
}
