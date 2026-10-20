package com.mailinbox.crm_service.controller;

import com.mailinbox.crm_service.dto.EmailTrackingRequestDTO;
import com.mailinbox.crm_service.dto.EmailTrackingResponseDTO;
import com.mailinbox.crm_service.entity.EmailTracking;
import com.mailinbox.crm_service.security.CurrentPrincipal;
import com.mailinbox.crm_service.security.CurrentUserService;
import com.mailinbox.crm_service.service.EmailTrackingService;
import com.mailinbox.crm_service.repository.CampaignRepository;
import com.mailinbox.crm_service.repository.ContactRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/email-tracking")
@RequiredArgsConstructor
public class EmailTrackingController {

    private final EmailTrackingService service;
    private final CampaignRepository campaignRepository;
    private final ContactRepository contactRepository;
    private final CurrentUserService currentUserService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<EmailTrackingResponseDTO> create(@Valid @RequestBody EmailTrackingRequestDTO request,
                                                            @AuthenticationPrincipal Jwt jwt) {
        CurrentPrincipal principal = currentUserService.resolve(jwt);
        EmailTracking tracking = new EmailTracking();
        tracking.setAdresseIP(request.getAdresseIP());

        // Liaison sécurisée avec la Campagne et le Contact
        tracking.setCampaign(campaignRepository.findById(request.getCampaignId())
                .orElseThrow(() -> new RuntimeException("Campagne non trouvée avec l'ID: " + request.getCampaignId())));

        tracking.setContact(contactRepository.findById(request.getContactId())
                .orElseThrow(() -> new RuntimeException("Contact non trouvé avec l'ID: " + request.getContactId())));

        EmailTracking saved = service.save(tracking, principal);
        return ResponseEntity.ok(service.mapToResponseDTO(saved));
    }


    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'INTEGRATEUR', 'CLIENT')")
    public ResponseEntity<EmailTrackingResponseDTO> getById(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        CurrentPrincipal principal = currentUserService.resolve(jwt);
        EmailTracking entity = service.findByIdVisible(id, principal);
        return ResponseEntity.ok(service.mapToResponseDTO(entity));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'INTEGRATEUR', 'CLIENT')")
    public ResponseEntity<List<EmailTrackingResponseDTO>> getAll(@AuthenticationPrincipal Jwt jwt) {
        CurrentPrincipal principal = currentUserService.resolve(jwt);
        return ResponseEntity.ok(service.findAll(principal));
    }

   
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        CurrentPrincipal principal = currentUserService.resolve(jwt);
        service.deleteById(id, principal);
        return ResponseEntity.noContent().build();
    }

    // ─── ENDPOINTS DE TRACKING (MÉTIER) ──────────────────────────────────────


    @PatchMapping("/{id}/open")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'INTEGRATEUR', 'CLIENT')")
    public ResponseEntity<Void> markAsOpened(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        CurrentPrincipal principal = currentUserService.resolve(jwt);
        service.markAsOpened(id, principal);
        return ResponseEntity.ok().build();
    }

    /**
     * TRACKING CLIC : Enregistre un clic sur un lien spécifique
     */
    @PatchMapping("/{id}/click")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'INTEGRATEUR', 'CLIENT')")
    public ResponseEntity<Void> markAsClicked(@PathVariable Long id, @RequestParam String url,
                                               @AuthenticationPrincipal Jwt jwt) {
        CurrentPrincipal principal = currentUserService.resolve(jwt);
        service.markAsClicked(id, url, principal);
        return ResponseEntity.ok().build();
    }


    

}
