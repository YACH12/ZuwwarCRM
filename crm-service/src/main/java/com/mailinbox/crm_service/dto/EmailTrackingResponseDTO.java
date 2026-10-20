package com.mailinbox.crm_service.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EmailTrackingResponseDTO {
    private Long id;
    private String adresseIP;
    private LocalDateTime createdAt;
    
    private Long campaignId;
    private String campaignStatus;
    
    private Long contactId;
    private String contactEmail;
    
    private Boolean ouvert;
    private LocalDateTime ouvertAt;
    private Boolean clique;
}