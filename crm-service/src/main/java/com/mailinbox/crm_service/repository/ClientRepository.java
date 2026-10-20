package com.mailinbox.crm_service.repository;

import com.mailinbox.crm_service.entity.Client;
import com.mailinbox.crm_service.enums.StatutClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {

    // ── Recherche ─────────────────────────────────────────────────────────────
    Optional<Client> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<Client> findByTokenVerification(String token);
    Optional<Client> findByKeycloakId(String keycloakId);

    // ── Filtres ───────────────────────────────────────────────────────────────
    Page<Client> findByPlanTierId(String planTierId, Pageable pageable);
    Page<Client> findByStatut(StatutClient statut, Pageable pageable);

    // ── Statistiques ──────────────────────────────────────────────────────────
    @Query("SELECT COUNT(c) FROM Client c WHERE c.statut = 'ACTIF'")
    long countActifs();

    @Query("SELECT COUNT(c) FROM Client c WHERE c.planTier.code = :code")
    long countByPlanCode(@Param("code") String code);
}