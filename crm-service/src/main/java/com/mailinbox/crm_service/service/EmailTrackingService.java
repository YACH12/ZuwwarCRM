package com.mailinbox.crm_service.service;

import com.mailinbox.crm_service.dto.EmailTrackingRequestDTO;
import com.mailinbox.crm_service.dto.EmailTrackingResponseDTO;
import com.mailinbox.crm_service.entity.EmailTracking;
import com.mailinbox.crm_service.exception.NotFoundException;
import com.mailinbox.crm_service.repository.EmailTrackingRepository;
import com.mailinbox.crm_service.security.CurrentPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmailTrackingService {

    private final EmailTrackingRepository repository;
    private final EngagementScoringService engagementScoringService;

    // L'injection par constructeur est recommandée dans Spring
    public EmailTrackingService(EmailTrackingRepository repository, EngagementScoringService engagementScoringService) {
        this.repository = repository;
        this.engagementScoringService = engagementScoringService;
    }

    public List<EmailTrackingResponseDTO> findAll(CurrentPrincipal principal) {
        List<EmailTracking> trackings = principal.isClient()
                ? repository.findByCampaign_ClientId(principal.client().getId())
                : repository.findAll();
        return trackings.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public EmailTracking findByIdVisible(Long id, CurrentPrincipal principal) {
        EmailTracking tracking = fetchOrThrow(id);
        assertVisible(tracking, principal);
        return tracking;
    }

    private EmailTracking fetchOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Suivi email non trouvé : " + id));
    }

    // 404 générique (pas 403) pour ne pas révéler l'existence d'une ressource chez un autre tenant
    private void assertVisible(EmailTracking tracking, CurrentPrincipal principal) {
        if (!principal.isClient()) {
            return;
        }
        Long campaignClientId = tracking.getCampaign() != null ? tracking.getCampaign().getClientId() : null;
        if (campaignClientId == null || !campaignClientId.equals(principal.client().getId())) {
            throw new NotFoundException("Suivi email non trouvé : " + tracking.getId());
        }
    }

    public List<EmailTracking> findByCampaignId(Long campaignId) {
        return repository.findByCampaignId(campaignId);
    }

    @Transactional
    public EmailTracking save(EmailTracking emailTracking, CurrentPrincipal principal) {
        assertVisible(emailTracking, principal);
        return repository.save(emailTracking);
    }

    @Transactional
    public void deleteById(Long id, CurrentPrincipal principal) {
        EmailTracking tracking = fetchOrThrow(id);
        assertVisible(tracking, principal);
        repository.deleteById(id);
    }

    // --- Méthodes Métier pour le Tracking ---

    @Transactional
    public void markAsOpened(Long id, CurrentPrincipal principal) {
        EmailTracking tracking = fetchOrThrow(id);
        assertVisible(tracking, principal);
        if (!tracking.getOuvert()) {
            tracking.setOuvert(true);
            tracking.setOuvertAt(LocalDateTime.now());
            repository.save(tracking);
            if (tracking.getContact() != null) {
                engagementScoringService.onEmailOpened(tracking.getContact());
            }
        }
    }

    @Transactional
    public void markAsClicked(Long id, String url, CurrentPrincipal principal) {
        EmailTracking tracking = fetchOrThrow(id);
        assertVisible(tracking, principal);
        tracking.setClique(true);
        tracking.setCliqueAt(LocalDateTime.now());
        tracking.setUrlCliquee(url);
        repository.save(tracking);
        if (tracking.getContact() != null) {
            engagementScoringService.onLinkClicked(tracking.getContact());
        }
    }

    @Transactional
    public void markAsUnsubscribed(Long id) {
        repository.findById(id).ifPresent(tracking -> {
            tracking.setDesabonne(true);
            tracking.setDesabonneAt(LocalDateTime.now());
            // Si l'utilisateur se désabonne, on met généralement à jour la préférence "nePasEnvoyer"
            tracking.setNePassEnvoyer(true);
            repository.save(tracking);
            if (tracking.getContact() != null) {
                engagementScoringService.onUnsubscribed(tracking.getContact());
            }
        });
    }

    public EmailTrackingResponseDTO mapToResponseDTO(EmailTracking entity) {
        EmailTrackingResponseDTO dto = new EmailTrackingResponseDTO();
        dto.setId(entity.getId());
        dto.setAdresseIP(entity.getAdresseIP());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setOuvert(entity.getOuvert());
        dto.setOuvertAt(entity.getOuvertAt());
        dto.setClique(entity.getClique());

        if (entity.getCampaign() != null) {
            dto.setCampaignId(entity.getCampaign().getId());
            dto.setCampaignStatus(entity.getCampaign().getStatut().toString());
        }

        if (entity.getContact() != null) {
            dto.setContactId(entity.getContact().getId());
            dto.setContactEmail(entity.getContact().getEmail());
        }

        return dto;
    }
}
