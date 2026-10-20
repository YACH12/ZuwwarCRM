package com.mailinbox.crm_service.service;

import com.mailinbox.crm_service.entity.Deal;
import com.mailinbox.crm_service.enums.DealStage;
import com.mailinbox.crm_service.exception.NotFoundException;
import com.mailinbox.crm_service.exception.ValidationException;
import com.mailinbox.crm_service.repository.DealRepository;
import com.mailinbox.crm_service.security.CurrentPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DealService {

    private final DealRepository  dealRepository;
    private final ActiviteService activiteService;
    private final ContactService contactService;
    private final EntrepriseService entrepriseService;

    public Page<Deal> getAll(Pageable pageable, CurrentPrincipal principal) {
        if (principal.isClient()) {
            return dealRepository.findAllByClientId(principal.client().getId(), pageable);
        }
        return dealRepository.findAll(pageable);
    }

    public List<Deal> getByStage(DealStage stage, CurrentPrincipal principal) {
        if (principal.isClient()) {
            return dealRepository.findByClientIdAndStage(principal.client().getId(), stage);
        }
        return dealRepository.findByStage(stage);
    }

    public Deal getById(Long id, CurrentPrincipal principal) {
        Deal deal = fetchOrThrow(id);
        assertVisible(deal, principal);
        return deal;
    }

    private Deal fetchOrThrow(Long id) {
        return dealRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Deal introuvable : " + id));
    }

    private void assertVisible(Deal deal, CurrentPrincipal principal) {
        if (principal.isClient()
                && (deal.getClientId() == null || !deal.getClientId().equals(principal.client().getId()))) {
            throw new NotFoundException("Deal introuvable : " + deal.getId());
        }
    }

    // Vérifie que le contact/l'entreprise liés au deal appartiennent bien au tenant du principal
    private void assertLiensDansLeTenant(Deal deal, CurrentPrincipal principal) {
        if (!principal.isClient()) return;
        if (deal.getContact() != null && deal.getContact().getId() != null) {
            contactService.getContactById(deal.getContact().getId(), principal);
        }
        if (deal.getEntreprise() != null && deal.getEntreprise().getId() != null) {
            entrepriseService.assertVisible(
                    entrepriseService.fetchOrThrow(deal.getEntreprise().getId()), principal);
        }
    }

    @Transactional
    public Deal create(Deal deal, CurrentPrincipal principal) {
        assertLiensDansLeTenant(deal, principal);
        if (principal.isClient()) {
            deal.setClientId(principal.client().getId());
        }
        return dealRepository.save(deal);
    }

    @Transactional
    public Deal update(Long id, Deal request, CurrentPrincipal principal) {
        Deal deal = fetchOrThrow(id);
        assertVisible(deal, principal);
        assertLiensDansLeTenant(request, principal);
        deal.setTitre(request.getTitre());
        deal.setMontant(request.getMontant());
        deal.setStage(request.getStage());
        deal.setContact(request.getContact());
        deal.setEntreprise(request.getEntreprise());
        deal.setDateClotureEstimee(request.getDateClotureEstimee());
        deal.setNotes(request.getNotes());
        return dealRepository.save(deal);
    }

    @Transactional
    public Deal changerStage(Long id, DealStage nouveauStage, CurrentPrincipal principal) {
        Deal deal = fetchOrThrow(id);
        assertVisible(deal, principal);
        deal.setStage(nouveauStage);
        if (nouveauStage == DealStage.GAGNE || nouveauStage == DealStage.PERDU) {
            deal.setDateCloture(LocalDateTime.now());
        }
        Deal updated = dealRepository.save(deal);

        try {
            activiteService.creerEvenementSysteme(
                    "Deal '" + updated.getTitre() + "' passé en " + nouveauStage.name(),
                    updated.getContact() != null ? updated.getContact().getId() : null,
                    updated.getId());
        } catch (Exception e) {
            log.warn("Activité non créée : {}", e.getMessage());
        }

        return updated;
    }

    // ── FIX : supprimer les activités liées avant de supprimer le deal ──────
    @Transactional
    public void delete(Long id, CurrentPrincipal principal) {
        Deal deal = fetchOrThrow(id);
        assertVisible(deal, principal);

        // Supprimer toutes les activités liées à ce deal pour éviter
        // la violation de contrainte de clé étrangère (FK activite.deal_id)
        try {
            activiteService.deleteByDealId(id);
        } catch (Exception e) {
            log.warn("Impossible de supprimer les activités du deal {} : {}", id, e.getMessage());
        }

        dealRepository.delete(deal);
        log.info("Deal {} supprimé avec ses activités liées", id);
    }

    public Map<String, Object> getStats(CurrentPrincipal principal) {
        Map<String, Object> stats = new HashMap<>();
        Map<String, Double> montantParStage = new HashMap<>();
        Map<String, Long>   countParStage   = new HashMap<>();
        Long clientId = principal.isClient() ? principal.client().getId() : null;

        for (DealStage stage : DealStage.values()) {
            Double montant = clientId != null
                    ? dealRepository.sumMontantByStageAndClientId(stage, clientId)
                    : dealRepository.sumMontantByStage(stage);
            montantParStage.put(stage.name(), montant != null ? montant : 0.0);
            countParStage.put(stage.name(), clientId != null
                    ? dealRepository.countByStageAndClientId(stage, clientId)
                    : dealRepository.countByStage(stage));
        }

        Double pipelineActif = clientId != null
                ? dealRepository.sumPipelineActifByClientId(clientId)
                : dealRepository.sumPipelineActif();
        stats.put("montantParStage", montantParStage);
        stats.put("countParStage", countParStage);
        stats.put("pipelineActif", pipelineActif != null ? pipelineActif : 0.0);
        stats.put("totalDeals", clientId != null ? dealRepository.countByClientId(clientId) : dealRepository.count());

        return stats;
    }
}