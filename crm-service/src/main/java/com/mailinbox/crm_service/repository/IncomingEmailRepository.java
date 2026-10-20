package com.mailinbox.crm_service.repository;

import com.mailinbox.crm_service.entity.IncomingEmail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncomingEmailRepository extends JpaRepository<IncomingEmail, Long> {

    @Query("SELECT e FROM IncomingEmail e WHERE e.clientId = :clientId ORDER BY e.receptionAt DESC")
    Page<IncomingEmail> findAllByClientId(@Param("clientId") Long clientId, Pageable pageable);

    @Query("SELECT e FROM IncomingEmail e ORDER BY e.receptionAt DESC")
    Page<IncomingEmail> findAllGlobal(Pageable pageable);

    @Query("SELECT e FROM IncomingEmail e WHERE e.contact.id = :contactId ORDER BY e.receptionAt DESC")
    List<IncomingEmail> findByContactId(@Param("contactId") Long contactId);

    long countByClientId(Long clientId);
}
