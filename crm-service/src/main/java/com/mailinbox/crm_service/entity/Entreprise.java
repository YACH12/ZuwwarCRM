package com.mailinbox.crm_service.entity;
import com.mailinbox.crm_service.enums.TailleEntreprise;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter
@Entity
@Table(name = "entreprise", uniqueConstraints = @UniqueConstraint(columnNames = {"client_id", "email"}))
public class Entreprise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // null = donnée interne/staff (partagée), non null = tenant propriétaire
    @Column(name = "client_id")
    private Long clientId;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String email;

    private String telephone;
    private String adresse;
    private String secteur;
    private String siteWeb;

    @Enumerated(EnumType.STRING)
    private TailleEntreprise taille;

    @Column(nullable = false)
    private Boolean deleted = false;

    private LocalDateTime deletedAt;

    // Contacts liés à cette entreprise — exposés via GET /entreprises/{id}/contacts,
    // jamais inline (évite LazyInitializationException quand une Entreprise est
    // sérialisée en tant qu'association d'une autre entité, ex. Deal.entreprise)
    @OneToMany(mappedBy = "entreprise", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Contact> contacts = new ArrayList<>();

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