package com.mailinbox.crm_service.repository;
import com.mailinbox.crm_service.entity.Imap;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImapRepository extends JpaRepository<Imap, Long>{

    Page<Imap> findByClientId(Long clientId, Pageable pageable);
    List<Imap> findByClientId(Long clientId);
    List<Imap> findByClientIdIsNull();
    Optional<Imap> findByClientIdAndActiveTrue(Long clientId);
    Optional<Imap> findByClientIdIsNullAndActiveTrue();
    List<Imap> findByActiveTrue();
}
