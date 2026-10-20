package com.mailinbox.crm_service.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.mailinbox.crm_service.enums.DealStage;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter
@Entity
@Table(
        name = "deal",
        indexes = @Index(name = "idx_deal_client_id", columnList = "client_id")
)
public class Deal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @Column(name = "client_id")
    private Long clientId;

    @NotBlank(message = "Le titre est obligatoire")
    @Column(nullable = false)
    private String titre;

    @DecimalMin(value = "0.0", inclusive = false, message = "Le montant doit être positif")
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal montant;

    @Column(nullable = false)
    private String devise = "MAD";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DealStage stage = DealStage.PROSPECT;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Column(nullable = false)
    private int probabilite = 20;

    @ManyToOne
    @JoinColumn(name = "contact_id")
    private Contact contact;

    @ManyToOne
    @JoinColumn(name = "entreprise_id")
    private Entreprise entreprise;

    private LocalDateTime dateClotureEstimee;
    private LocalDateTime dateCloture;

    private String notes;

    private double scoreIA = 0.0;

    @Column(nullable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        ajusterProbabilite();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        ajusterProbabilite();
        if (stage == DealStage.GAGNE || stage == DealStage.PERDU) {
            if (dateCloture == null) dateCloture = LocalDateTime.now();
        }
    }

    private void ajusterProbabilite() {
        switch (stage) {
            case PROSPECT      -> probabilite = 20;
            case QUALIFICATION -> probabilite = 40;
            case PROPOSITION   -> probabilite = 60;
            case NEGOCIATION   -> probabilite = 80;
            case GAGNE         -> probabilite = 100;
            case PERDU         -> probabilite = 0;
        }
    }
}