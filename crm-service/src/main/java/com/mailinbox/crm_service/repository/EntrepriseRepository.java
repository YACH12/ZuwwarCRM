package com.mailinbox.crm_service.repository;

import com.mailinbox.crm_service.entity.Entreprise;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;  // ← import Spring pas Swagger
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EntrepriseRepository extends JpaRepository<Entreprise, Long> {
    Optional<Entreprise> findByEmail(String email);
    boolean existsByEmail(String email);

    Page<Entreprise> findAllByClientId(Long clientId, Pageable pageable);
    boolean existsByEmailAndClientId(String email, Long clientId);
    boolean existsByEmailAndClientIdIsNull(String email);
}