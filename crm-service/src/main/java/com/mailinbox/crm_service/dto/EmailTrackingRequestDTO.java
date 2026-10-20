package com.mailinbox.crm_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EmailTrackingRequestDTO {
    @NotNull(message = "campaignId est obligatoire")
    private Long campaignId;

    @NotNull(message = "contactId est obligatoire")
    private Long contactId;

    private String adresseIP;
}