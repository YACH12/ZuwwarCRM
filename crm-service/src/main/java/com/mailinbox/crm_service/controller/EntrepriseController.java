package com.mailinbox.crm_service.controller;

import com.mailinbox.crm_service.entity.Entreprise;
import com.mailinbox.crm_service.security.CurrentPrincipal;
import com.mailinbox.crm_service.security.CurrentUserService;
import com.mailinbox.crm_service.service.EntrepriseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/entreprises")
@RequiredArgsConstructor
public class EntrepriseController {

    private final EntrepriseService entrepriseService;
    private final CurrentUserService currentUserService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<Page<Entreprise>> getAll(Pageable pageable, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(entrepriseService.getAll(pageable, currentUserService.resolve(jwt)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<Entreprise> getById(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(entrepriseService.getById(id, currentUserService.resolve(jwt)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<Entreprise> create(@RequestBody Entreprise entreprise, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(entrepriseService.create(entreprise, currentUserService.resolve(jwt)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<Entreprise> update(@PathVariable Long id,
                                              @RequestBody Entreprise entreprise,
                                              @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(entrepriseService.update(id, entreprise, currentUserService.resolve(jwt)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        entrepriseService.delete(id, currentUserService.resolve(jwt));
        return ResponseEntity.noContent().build();
    }

    // Récupérer les contacts d'une entreprise
    @GetMapping("/{id}/contacts")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<?> getContacts(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(entrepriseService.getById(id, currentUserService.resolve(jwt)).getContacts());
    }
}