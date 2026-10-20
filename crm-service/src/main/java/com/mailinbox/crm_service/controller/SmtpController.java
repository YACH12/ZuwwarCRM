package com.mailinbox.crm_service.controller;

import com.mailinbox.crm_service.entity.Smtp;
import com.mailinbox.crm_service.security.CurrentUserService;
import com.mailinbox.crm_service.service.SmtpService;
import jakarta.validation.Valid;
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
@RequestMapping("/smtps")
@RequiredArgsConstructor
public class SmtpController {

    private final SmtpService smtpService;
    private final CurrentUserService currentUserService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'INTEGRATEUR', 'CLIENT')")
    public ResponseEntity<Page<Smtp>> getAll(Pageable pageable, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(smtpService.getAllSmtps(pageable, currentUserService.resolve(jwt)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'INTEGRATEUR', 'CLIENT')")
    public ResponseEntity<Smtp> getById(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(smtpService.getSmtpById(id, currentUserService.resolve(jwt)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<Smtp> create(@Valid @RequestBody Smtp smtp, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(smtpService.createSmtp(smtp, currentUserService.resolve(jwt)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<Smtp> update(@PathVariable Long id, @Valid @RequestBody Smtp smtp, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(smtpService.updateSmtp(id, smtp, currentUserService.resolve(jwt)));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<Smtp> activate(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(smtpService.activateSmtp(id, currentUserService.resolve(jwt)));
    }

    @PostMapping("/{id}/test")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<Map<String, Object>> testConnection(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        boolean ok = smtpService.testSmtpConnection(id, currentUserService.resolve(jwt));
        return ResponseEntity.ok(Map.of(
            "success", ok,
            "message", ok ? "Connexion SMTP réussie" : "Connexion SMTP échouée"
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        smtpService.deleteSmtp(id, currentUserService.resolve(jwt));
        return ResponseEntity.noContent().build();
    }
}
