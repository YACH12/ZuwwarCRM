package com.mailinbox.crm_service.entity;

import com.mailinbox.crm_service.enums.TypeActivite;
import com.mailinbox.crm_service.enums.StatutActivite;
import com.mailinbox.crm_service.enums.PrioriteActivite;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Getter @Setter
@Entity
@Table(name = "activite")
public class Activite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // null = donnée interne/staff (partagée), non null = tenant propriétaire
    @Column(name = "client_id")
    private Long clientId;

    // ── Type d'activité ───────────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeActivite type;

    @Column(nullable = false)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    // ── Statut et priorité (pour les tâches) ─────────────────────────────────
    @Enumerated(EnumType.STRING)
    private StatutActivite statut = StatutActivite.A_FAIRE;

    @Enumerated(EnumType.STRING)
    private PrioriteActivite priorite = PrioriteActivite.NORMALE;

    // ── Relations optionnelles ────────────────────────────────────────────────
    @ManyToOne
    @JoinColumn(name = "contact_id")
    private Contact contact;

    // ── Qui a créé cette activité ─────────────────────────────────────────────
    private String creePar;          // email ou nom de l'utilisateur Keycloak
    private String roleCreateur;     // ADMIN, MANAGER, CLIENT

    // ── Dates ─────────────────────────────────────────────────────────────────
    private LocalDateTime dateEcheance;
    private LocalDateTime dateCreation;
    private LocalDateTime dateMiseAJour;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        dateMiseAJour = LocalDateTime.now();
    }

    @ManyToOne
@JoinColumn(name = "deal_id")
@OnDelete(action = OnDeleteAction.CASCADE)  
private Deal deal;
}