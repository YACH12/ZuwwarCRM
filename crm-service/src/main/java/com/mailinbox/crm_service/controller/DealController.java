package com.mailinbox.crm_service.controller;

import com.mailinbox.crm_service.entity.Deal;
import com.mailinbox.crm_service.enums.DealStage;
import com.mailinbox.crm_service.security.CurrentPrincipal;
import com.mailinbox.crm_service.security.CurrentUserService;
import com.mailinbox.crm_service.service.DealService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/deals")
@RequiredArgsConstructor
public class DealController {

    private final DealService dealService;
    private final CurrentUserService currentUserService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<Page<Deal>> getAll(Pageable pageable, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(dealService.getAll(pageable, currentUserService.resolve(jwt)));
    }

    @GetMapping("/stage/{stage}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<List<Deal>> getByStage(@PathVariable DealStage stage, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(dealService.getByStage(stage, currentUserService.resolve(jwt)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<Deal> getById(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(dealService.getById(id, currentUserService.resolve(jwt)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<Deal> create(@Valid @RequestBody Deal deal, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(dealService.create(deal, currentUserService.resolve(jwt)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<Deal> update(@PathVariable Long id, @Valid @RequestBody Deal deal, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(dealService.update(id, deal, currentUserService.resolve(jwt)));
    }

    @PutMapping("/{id}/stage")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<Deal> changerStage(
            @PathVariable Long id,
            @RequestParam DealStage stage,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(dealService.changerStage(id, stage, currentUserService.resolve(jwt)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        dealService.delete(id, currentUserService.resolve(jwt));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<Map<String, Object>> getStats(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(dealService.getStats(currentUserService.resolve(jwt)));
    }
}