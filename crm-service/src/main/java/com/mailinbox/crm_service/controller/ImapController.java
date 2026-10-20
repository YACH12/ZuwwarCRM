package com.mailinbox.crm_service.controller;

import com.mailinbox.crm_service.entity.Imap;
import com.mailinbox.crm_service.security.CurrentUserService;
import com.mailinbox.crm_service.service.ImapService;
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
@RequestMapping("/imaps")
@RequiredArgsConstructor
public class ImapController {

    private final ImapService imapService;
    private final CurrentUserService currentUserService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'INTEGRATEUR', 'CLIENT')")
    public ResponseEntity<Page<Imap>> getAll(Pageable pageable, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(imapService.getAllImaps(pageable, currentUserService.resolve(jwt)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'INTEGRATEUR', 'CLIENT')")
    public ResponseEntity<Imap> getById(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(imapService.getImapById(id, currentUserService.resolve(jwt)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<Imap> create(@Valid @RequestBody Imap imap, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(imapService.createImap(imap, currentUserService.resolve(jwt)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<Imap> update(@PathVariable Long id, @Valid @RequestBody Imap imap, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(imapService.updateImap(id, imap, currentUserService.resolve(jwt)));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<Imap> activate(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(imapService.activateImap(id, currentUserService.resolve(jwt)));
    }

    @PostMapping("/{id}/test")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<Map<String, Object>> testConnection(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        boolean ok = imapService.testImapConnection(id, currentUserService.resolve(jwt));
        return ResponseEntity.ok(Map.of(
            "success", ok,
            "message", ok ? "Connexion IMAP réussie" : "Connexion IMAP échouée"
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        imapService.deleteImap(id, currentUserService.resolve(jwt));
        return ResponseEntity.noContent().build();
    }
}
