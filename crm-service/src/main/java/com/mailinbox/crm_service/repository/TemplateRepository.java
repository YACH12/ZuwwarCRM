package com.mailinbox.crm_service.repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.mailinbox.crm_service.entity.Template;


@Repository
public interface TemplateRepository extends JpaRepository<Template, Long> {

    @Query("SELECT t FROM Template t WHERE t.clientId = :clientId OR t.clientId IS NULL")
    Page<Template> findAllVisiblesParClient(@Param("clientId") Long clientId, Pageable pageable);
}
