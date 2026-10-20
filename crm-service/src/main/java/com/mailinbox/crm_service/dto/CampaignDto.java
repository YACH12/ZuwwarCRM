package com.mailinbox.crm_service.dto;

import com.mailinbox.crm_service.enums.CampaignType;
import com.mailinbox.crm_service.enums.Statut;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CampaignDto {

    private Long id;
    private Long clientId;
    private String name;
    private String subject;
    private String htmlContent;
    
    private TemplateSummaryDto template;
    

    private Statut statut;
    private CampaignType type;
    
    private LocalDateTime scheduledAt;
    private LocalDateTime sentAt;
    
    private Integer totalSent;
    private Integer totalBounced;
    private Integer totalClicks;
    private Integer totalOpened;
    private Double openRate;
    private Double clickRate;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class TemplateSummaryDto {
        private Long id;
        private String nom; 
    }
}