package com.mailinbox.crm_service.repository;

import com.mailinbox.crm_service.entity.Campaign;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {

    @Query("SELECT c FROM Campaign c LEFT JOIN FETCH c.contacts WHERE c.id = :id")
    Optional<Campaign> findByIdWithContacts(@Param("id") Long id);

    Page<Campaign> findAllByClientId(Long clientId, Pageable pageable);
}
