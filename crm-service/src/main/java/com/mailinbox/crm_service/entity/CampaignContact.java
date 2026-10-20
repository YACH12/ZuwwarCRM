package com.mailinbox.crm_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter @Setter
@Entity
@Table(name = "campaign_contact_tracking")
public class CampaignContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "campaign_id", nullable = false)
    private Campaign campaign;

    @ManyToOne
    @JoinColumn(name = "contact_id", nullable = false)
    private Contact contact;

    private Boolean ouvert = false;
    private Boolean clique = false;
    private Boolean rebondi = false;

    private LocalDateTime envoyeAt;
    private LocalDateTime ouvertAt;
    private LocalDateTime cliqueAt;
}