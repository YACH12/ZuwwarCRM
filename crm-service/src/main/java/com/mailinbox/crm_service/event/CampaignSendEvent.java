package com.mailinbox.crm_service.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CampaignSendEvent {
    private Long campaignId;
    private String campaignName;
}