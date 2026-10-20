package com.mailinbox.crm_service.controller;

import com.mailinbox.crm_service.dto.CampaignDto;
import com.mailinbox.crm_service.entity.Campaign;
import com.mailinbox.crm_service.security.CurrentUserService;
import com.mailinbox.crm_service.service.CampaignService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/campaigns")
@RequiredArgsConstructor
public class CampaignController {

    private final CampaignService campaignService;
    private final CurrentUserService currentUserService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'INTEGRATEUR', 'CLIENT')")
    public ResponseEntity<Page<CampaignDto>> getAll(Pageable pageable, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(campaignService.getAll(pageable, currentUserService.resolve(jwt)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'INTEGRATEUR', 'CLIENT')")
    public ResponseEntity<CampaignDto> getById(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(campaignService.getById(id, currentUserService.resolve(jwt)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<CampaignDto> create(@RequestBody Campaign campaign, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(campaignService.create(campaign, currentUserService.resolve(jwt)));
    }

    @PostMapping("/{id}/contacts")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<CampaignDto> addContacts(@PathVariable Long id,
                                                   @RequestBody List<Long> contactIds,
                                                   @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(campaignService.addContacts(id, contactIds, currentUserService.resolve(jwt)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<CampaignDto> update(@PathVariable Long id,
                                              @RequestBody Campaign campaign,
                                              @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(campaignService.update(id, campaign, currentUserService.resolve(jwt)));
    }

    @PutMapping("/{id}/send")
    @PreAuthorize("hasAnyRole('ADMIN', 'INTEGRATEUR', 'CLIENT')")
    public ResponseEntity<CampaignDto> send(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(campaignService.send(id, currentUserService.resolve(jwt)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        campaignService.delete(id, currentUserService.resolve(jwt));
        return ResponseEntity.noContent().build();
    }
}