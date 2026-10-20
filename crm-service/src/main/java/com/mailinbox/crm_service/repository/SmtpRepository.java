package com.mailinbox.crm_service.repository;
import com.mailinbox.crm_service.entity.Smtp;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SmtpRepository extends JpaRepository<Smtp, Long>{

    Page<Smtp> findByClientId(Long clientId, Pageable pageable);
    List<Smtp> findByClientId(Long clientId);
    List<Smtp> findByClientIdIsNull();
    Optional<Smtp> findByClientIdAndActiveTrue(Long clientId);
    Optional<Smtp> findByClientIdIsNullAndActiveTrue();
}

