package com.mailinbox.crm_service.repository;

import com.mailinbox.crm_service.entity.CampaignContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CampaignContactRepository 
    extends JpaRepository<CampaignContact, Long> {
    
    List<CampaignContact> findByContactId(Long contactId);
    List<CampaignContact> findByCampaignId(Long campaignId);
}