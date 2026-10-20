package com.mailinbox.crm_service.repository;

import com.mailinbox.crm_service.entity.Activite;
import com.mailinbox.crm_service.enums.TypeActivite;
import com.mailinbox.crm_service.enums.StatutActivite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ActiviteRepository extends JpaRepository<Activite, Long> {

    Page<Activite> findAllByOrderByDateCreationDesc(Pageable pageable);
    List<Activite> findByContactIdOrderByDateCreationDesc(Long contactId);
    List<Activite> findByDealIdOrderByDateCreationDesc(Long dealId);
    List<Activite> findByTypeOrderByDateCreationDesc(TypeActivite type);
    List<Activite> findByStatutOrderByDateEcheanceAsc(StatutActivite statut);
    void deleteByDealId(Long dealId);

    long countByStatut(StatutActivite statut);
    long countByType(TypeActivite type);

    // ── Vues scopées par tenant (rôle CLIENT) ────────────────────────────────
    Page<Activite> findAllByClientIdOrderByDateCreationDesc(Long clientId, Pageable pageable);
    List<Activite> findByClientIdAndStatutOrderByDateEcheanceAsc(Long clientId, StatutActivite statut);
    long countByStatutAndClientId(StatutActivite statut, Long clientId);
    long countByTypeAndClientId(TypeActivite type, Long clientId);
    long countByClientId(Long clientId);
}