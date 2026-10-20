package com.mailinbox.crm_service.controller;

import com.mailinbox.crm_service.entity.IncomingEmail;
import com.mailinbox.crm_service.security.CurrentPrincipal;
import com.mailinbox.crm_service.security.CurrentUserService;
import com.mailinbox.crm_service.service.IncomingEmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/incoming-emails")
@RequiredArgsConstructor
public class IncomingEmailController {

    private final IncomingEmailService incomingEmailService;
    private final CurrentUserService currentUserService;

    // ── Lister les emails reçus ───────────────────────────────────────────────
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'INTEGRATEUR', 'CLIENT')")
    public ResponseEntity<Page<IncomingEmail>> getAll(Pageable pageable, @AuthenticationPrincipal Jwt jwt) {
        CurrentPrincipal principal = currentUserService.resolve(jwt);
        return ResponseEntity.ok(incomingEmailService.getAllEmails(pageable, principal));
    }

    // ── Récupérer un email par ID ─────────────────────────────────────────────
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'INTEGRATEUR', 'CLIENT')")
    public ResponseEntity<IncomingEmail> getById(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        CurrentPrincipal principal = currentUserService.resolve(jwt);
        return ResponseEntity.ok(incomingEmailService.getEmailById(id, principal));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<?> receive(@RequestBody IncomingEmail email, @AuthenticationPrincipal Jwt jwt) {
        try {
            CurrentPrincipal principal = currentUserService.resolve(jwt);
            return ResponseEntity.ok(incomingEmailService.recevoirEmail(email, principal));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    
    @PatchMapping("/{id}/contact/{contactId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<IncomingEmail> assignContact(@PathVariable Long id, @PathVariable Long contactId,
                                                        @AuthenticationPrincipal Jwt jwt) {
        CurrentPrincipal principal = currentUserService.resolve(jwt);
        return ResponseEntity.ok(incomingEmailService.assignContact(id, contactId, principal));
    }
}
