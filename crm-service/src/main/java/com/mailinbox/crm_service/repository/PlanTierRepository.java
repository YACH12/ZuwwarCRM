package com.mailinbox.crm_service.repository;
import com.mailinbox.crm_service.entity.PlanTier;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;



@Repository
public interface PlanTierRepository extends JpaRepository<PlanTier, String> {
    Optional<PlanTier> findByCode(String code);
    boolean existsByCode(String code);
    List<PlanTier> findByActifTrue();
}
    

