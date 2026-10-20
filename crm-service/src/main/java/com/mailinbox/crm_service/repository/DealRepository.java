package com.mailinbox.crm_service.repository;

import com.mailinbox.crm_service.entity.Deal;
import com.mailinbox.crm_service.enums.DealStage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DealRepository extends JpaRepository<Deal, Long> {

    List<Deal> findByStage(DealStage stage);
    Page<Deal> findByStage(DealStage stage, Pageable pageable);

    @Query("SELECT SUM(d.montant) FROM Deal d WHERE d.stage = :stage")
    Double sumMontantByStage(DealStage stage);

    @Query("SELECT COUNT(d) FROM Deal d WHERE d.stage = :stage")
    long countByStage(DealStage stage);

    @Query("SELECT SUM(d.montant) FROM Deal d WHERE d.stage NOT IN ('GAGNE','PERDU')")
    Double sumPipelineActif();

    // ── Vues scopées par tenant (rôle CLIENT) ────────────────────────────────
    Page<Deal> findAllByClientId(Long clientId, Pageable pageable);
    List<Deal> findByClientIdAndStage(Long clientId, DealStage stage);

    @Query("SELECT SUM(d.montant) FROM Deal d WHERE d.stage = :stage AND d.clientId = :clientId")
    Double sumMontantByStageAndClientId(DealStage stage, Long clientId);

    @Query("SELECT COUNT(d) FROM Deal d WHERE d.stage = :stage AND d.clientId = :clientId")
    long countByStageAndClientId(DealStage stage, Long clientId);

    @Query("SELECT SUM(d.montant) FROM Deal d WHERE d.stage NOT IN ('GAGNE','PERDU') AND d.clientId = :clientId")
    Double sumPipelineActifByClientId(Long clientId);

    long countByClientId(Long clientId);
}