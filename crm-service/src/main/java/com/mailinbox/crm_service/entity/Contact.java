package com.mailinbox.crm_service.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.validator.constraints.Range;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.mailinbox.crm_service.enums.RoleSource;
import com.mailinbox.crm_service.enums.RoleStatut;
import com.mailinbox.crm_service.enums.RoleleadStage;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter
@Entity
@Table(name = "contact", uniqueConstraints = @UniqueConstraint(columnNames = {"client_id", "email"}))
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // null = donnée interne/staff (partagée), non null = tenant propriétaire
    @Column(name = "client_id")
    private Long clientId;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "L'email doit être valide")
    @Column(nullable = false)
    private String email;

    @NotBlank(message = "Le nom est obligatoire")
    @Column(nullable = false)
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false)
    private String telephone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleStatut status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleSource source;

    // Score d'engagement simple (sans AI), calculé à partir des événements de tracking
    @Range(min = 0, max = 100)
    private Double scoreEngagement = 0.0;

    private LocalDateTime derniereActiviteEngagement;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleleadStage leadStage = RoleleadStage.New;

    // ── Lien vers l'entreprise ────────────────────────────────────────────────
    @ManyToOne
    @JoinColumn(name = "entreprise_id")
    @JsonIgnoreProperties({"contacts", "createdAt", "updatedAt"})
    private Entreprise entreprise;

    private String poste;

    @Column(nullable = false)
    private String typeContact = "INDIVIDU";

    // ── Soft Delete ───────────────────────────────────────────────────────────
    @Column(nullable = false)
    private boolean deleted = false;

    private LocalDateTime deletedAt;

    // ── Cascade vers EmailTracking ────────────────────────────────────────────
    @OneToMany(mappedBy = "contact", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<EmailTracking> emailTrackings = new ArrayList<>();

    // ── Dates ─────────────────────────────────────────────────────────────────
    @Column(updatable = false)
    private LocalDateTime creatAt;

    private LocalDateTime updateAt;

    @PrePersist
    protected void onCreate() {
        creatAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updateAt = LocalDateTime.now();
    }
}