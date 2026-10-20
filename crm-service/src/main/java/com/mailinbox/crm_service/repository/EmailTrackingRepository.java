package com.mailinbox.crm_service.repository;

import com.mailinbox.crm_service.entity.EmailTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmailTrackingRepository extends JpaRepository<EmailTracking, Long> {
    
    List<EmailTracking> findByCampaignId(Long campaignId);
    
    List<EmailTracking> findByContactId(Long contactId);

    List<EmailTracking> findByCampaign_ClientId(Long clientId);

    Optional<EmailTracking> findByToken(String token);

    long countByCampaignIdAndOuvertTrue(Long campaignId);

    long countByCampaignIdAndCliqueTrue(Long campaignId);
}