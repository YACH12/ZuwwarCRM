package com.mailinbox.crm_service.controller;

import com.mailinbox.crm_service.entity.Contact;
import com.mailinbox.crm_service.security.CurrentPrincipal;
import com.mailinbox.crm_service.security.CurrentUserService;
import com.mailinbox.crm_service.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;
    private final CurrentUserService currentUserService;

    // ── Lister tous les contacts ──────────────────────────────────────────────
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'INTEGRATEUR', 'CLIENT')")
    public ResponseEntity<Page<Contact>> getAll(Pageable pageable, @AuthenticationPrincipal Jwt jwt) {
        CurrentPrincipal principal = currentUserService.resolve(jwt);
        return ResponseEntity.ok(contactService.getAllContacts(pageable, principal));
    }

    // ── Récupérer par ID ──────────────────────────────────────────────────────
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'INTEGRATEUR', 'CLIENT')")
    public ResponseEntity<Contact> getById(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        CurrentPrincipal principal = currentUserService.resolve(jwt);
        return ResponseEntity.ok(contactService.getContactById(id, principal));
    }

    // ── Créer un contact ──────────────────────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<?> create(@Valid @RequestBody Contact contact, @AuthenticationPrincipal Jwt jwt) {
        try {
            CurrentPrincipal principal = currentUserService.resolve(jwt);
            return ResponseEntity.ok(contactService.createContact(contact, principal));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", e.getMessage())
            );
        }
    }

    // ── Modifier un contact ───────────────────────────────────────────────────
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @Valid @RequestBody Contact contact,
            @AuthenticationPrincipal Jwt jwt) {
        try {
            CurrentPrincipal principal = currentUserService.resolve(jwt);
            return ResponseEntity.ok(contactService.updateContact(id, contact, principal));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", e.getMessage())
            );
        }
    }

    // ── Supprimer un contact (soft delete) ────────────────────────────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        CurrentPrincipal principal = currentUserService.resolve(jwt);
        contactService.deleteContact(id, principal);
        return ResponseEntity.noContent().build();
    }

    // ── Import CSV ────────────────────────────────────────────────────────────
    @PostMapping(value = "/import-csv", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<Map<String, Object>> importCSV(
            @RequestParam("file") MultipartFile file, @AuthenticationPrincipal Jwt jwt) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "Le fichier est vide")
            );
        }
        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.endsWith(".csv")) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "Le fichier doit être au format CSV")
            );
        }

        CurrentPrincipal principal = currentUserService.resolve(jwt);
        ContactService.ImportResult result = contactService.importCSV(file, principal);
        return ResponseEntity.ok(Map.of(
            "message", result.getSuccessCount() + " contact(s) importé(s), "
                        + result.getErrorCount() + " erreur(s)",
            "success", result.getSuccessCount(),
            "errors",  result.getErrors()
        ));
    }

    // ── Score d'engagement d'un contact (lecture DB) ─────────────────────────
    @GetMapping("/{id}/score")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'INTEGRATEUR', 'CLIENT')")
    public ResponseEntity<Map<String, Object>> getContactScore(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        CurrentPrincipal principal = currentUserService.resolve(jwt);
        Contact contact = contactService.getContactById(id, principal);
        return ResponseEntity.ok(Map.of(
            "contactId",       contact.getId(),
            "scoreEngagement", contact.getScoreEngagement() != null ? contact.getScoreEngagement() : 0.0,
            "leadStage",       contact.getLeadStage() != null ? contact.getLeadStage().name() : "New"
        ));
    }

    // ── Recalcul du score d'engagement d'un contact depuis son historique ────
    // Déterministe (pas d'IA) : ouvert au rôle CLIENT pour ses propres contacts.
    @PostMapping("/{id}/score/recalculate")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<?> recalculateScore(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        try {
            CurrentPrincipal principal = currentUserService.resolve(jwt);
            Contact updated = contactService.recalculerScoreEngagement(id, principal);
            return ResponseEntity.ok(Map.of(
                "contactId",       updated.getId(),
                "scoreEngagement", updated.getScoreEngagement(),
                "leadStage",       updated.getLeadStage() != null ? updated.getLeadStage().name() : "New"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", e.getMessage())
            );
        }
    }

    // ── Recalcul du score d'engagement de tous les contacts (staff uniquement, non scopé) ──
    @PostMapping("/update-all-scores")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> updateAllScores(@AuthenticationPrincipal Jwt jwt) {
        CurrentPrincipal principal = currentUserService.resolve(jwt);
        Page<Contact> contacts = contactService.getAllContacts(Pageable.unpaged(), principal);
        int success = 0;
        int errors  = 0;
        for (Contact c : contacts.getContent()) {
            try {
                contactService.recalculerScoreEngagement(c.getId(), principal);
                success++;
            } catch (Exception e) {
                errors++;
            }
        }
        return ResponseEntity.ok(Map.of(
            "message", success + " score(s) recalculé(s), " + errors + " erreur(s)",
            "success", success,
            "errors",  errors
        ));
    }
}