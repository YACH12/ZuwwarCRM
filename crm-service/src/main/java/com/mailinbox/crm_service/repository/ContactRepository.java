package com.mailinbox.crm_service.repository;

import com.mailinbox.crm_service.entity.Contact;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {

    @Query("SELECT c FROM Contact c WHERE c.deleted = false")
    Page<Contact> findAllActive(Pageable pageable);

    @Query("SELECT c FROM Contact c WHERE c.deleted = false AND c.clientId = :clientId")
    Page<Contact> findAllActiveByClientId(@Param("clientId") Long clientId, Pageable pageable);


    @Query("SELECT c FROM Contact c WHERE c.deleted = false AND c.clientId IS NULL")
    Page<Contact> findAllActiveInternal(Pageable pageable);

    @Query("SELECT COUNT(c) > 0 FROM Contact c WHERE c.email = :email AND c.deleted = false AND c.clientId = :clientId")
    boolean existsByEmailActiveForClient(@Param("email") String email, @Param("clientId") Long clientId);

    @Query("SELECT COUNT(c) > 0 FROM Contact c WHERE c.email = :email AND c.deleted = false AND c.clientId IS NULL")
    boolean existsByEmailActiveGlobal(@Param("email") String email);

    @Query("SELECT c FROM Contact c WHERE c.deleted = false AND c.scoreEngagement > 0 " +
           "AND (c.derniereActiviteEngagement IS NULL OR c.derniereActiviteEngagement < :seuil)")
    List<Contact> findInactifsAvecScore(@Param("seuil") LocalDateTime seuil);

    @Query("SELECT COUNT(c) > 0 FROM Contact c WHERE c.email = :email AND c.deleted = false")
    boolean existsByEmailActive(@Param("email") String email);

    @Query("SELECT c FROM Contact c WHERE c.email = :email AND c.deleted = false")
    Optional<Contact> findByEmail(@Param("email") String email);

    @Query("SELECT c FROM Contact c WHERE c.email = :email AND c.deleted = false AND c.clientId = :clientId")
    Optional<Contact> findByEmailAndClientId(@Param("email") String email, @Param("clientId") Long clientId);

    boolean existsByEmail(String email);
}