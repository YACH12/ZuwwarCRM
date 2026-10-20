package com.mailinbox.crm_service.entity;

import com.mailinbox.crm_service.enums.CampaignType;
import com.mailinbox.crm_service.enums.Statut;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(
        name = "campaign", // ✅ typo "compaign" corrigée
        indexes = @Index(name = "idx_campaign_client_id", columnList = "client_id")
)
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ verrouillage optimiste : compteurs incrémentés concurremment lors d'un envoi
    @Version
    private Long version;

    @Column(name = "client_id")
    private Long clientId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String htmlContent;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "template_id")
    @JsonIgnoreProperties({"creatAt", "updateAt"})
    private Template template;

    // ✅ EAGER -> LAZY : évite le conflit Hibernate avec le JOIN FETCH de CampaignRepository
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "campaign_contact",
            joinColumns = @JoinColumn(name = "campaign_id"),
            inverseJoinColumns = @JoinColumn(name = "contact_id")
    )
    private List<Contact> contacts = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Statut statut = Statut.DRAFT;

    private LocalDateTime scheduledAt;
    private LocalDateTime sentAt;

    @Column(nullable = false)
    private Integer totalSent = 0;

    @Column(nullable = false)
    private Integer totalBounced = 0;

    @Column(nullable = false)
    private Integer totalClicks = 0;

    @Transient
    private Integer totalOpened = 0;

    @Transient
    private Double openRate = 0.0;

    @Transient
    private Double clickRate = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CampaignType type = CampaignType.EMAIL;

    // ✅ renommé creatAt/updateAt -> createdAt/updatedAt (cohérence avec le reste des entités)
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