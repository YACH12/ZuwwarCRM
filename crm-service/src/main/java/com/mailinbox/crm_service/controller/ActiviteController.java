package com.mailinbox.crm_service.controller;

import com.mailinbox.crm_service.entity.Activite;
import com.mailinbox.crm_service.enums.StatutActivite;
import com.mailinbox.crm_service.enums.TypeActivite;
import com.mailinbox.crm_service.enums.PrioriteActivite;
import com.mailinbox.crm_service.security.CurrentPrincipal;
import com.mailinbox.crm_service.security.CurrentUserService;
import com.mailinbox.crm_service.service.ActiviteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/activites")
@RequiredArgsConstructor
public class ActiviteController {

    private final ActiviteService activiteService;
    private final CurrentUserService currentUserService;

    // ── Toutes les activités ──────────────────────────────────────────────────
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CLIENT')")
    public ResponseEntity<Page<Activite>> getAll(Pageable pageable, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(activiteService.getAll(pageable, currentUserService.resolve(jwt)));
    }

    // ── Activités d'un contact ────────────────────────────────────────────────
    @GetMapping("/contact/{contactId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CLIENT')")
    public ResponseEntity<List<Activite>> getByContact(@PathVariable Long contactId, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(activiteService.getByContact(contactId, currentUserService.resolve(jwt)));
    }

    // ── Activités d'un deal ───────────────────────────────────────────────────
    @GetMapping("/deal/{dealId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CLIENT')")
    public ResponseEntity<List<Activite>> getByDeal(@PathVariable Long dealId, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(activiteService.getByDeal(dealId, currentUserService.resolve(jwt)));
    }

    // ── Tâches à faire ────────────────────────────────────────────────────────
    @GetMapping("/taches/a-faire")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CLIENT')")
    public ResponseEntity<List<Activite>> getTachesAFaire(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(activiteService.getTachesAFaire(currentUserService.resolve(jwt)));
    }

    // ── Créer une activité ────────────────────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CLIENT')")
    public ResponseEntity<?> creer(@RequestBody Map<String, Object> payload, @AuthenticationPrincipal Jwt jwt) {
        Activite activite = new Activite();

        Object titreRaw = payload.get("titre");
        if (!(titreRaw instanceof String titre) || titre.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Le titre est obligatoire"));
        }
        activite.setTitre(titre);
        activite.setDescription((String) payload.get("description"));

        Object typeRaw = payload.get("type");
        if (typeRaw == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Le type d'activité est obligatoire"));
        }
        try {
            activite.setType(TypeActivite.valueOf(typeRaw.toString()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Type d'activité invalide : " + typeRaw));
        }

        activite.setCreePar((String) payload.get("creePar"));
        activite.setRoleCreateur((String) payload.get("roleCreateur"));

        Object prioriteRaw = payload.get("priorite");
        if (prioriteRaw != null) {
            try {
                activite.setPriorite(PrioriteActivite.valueOf(prioriteRaw.toString()));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Priorité invalide : " + prioriteRaw));
            }
        }

        Object dateEcheanceRaw = payload.get("dateEcheance");
        if (dateEcheanceRaw != null) {
            try {
                activite.setDateEcheance(LocalDateTime.parse(dateEcheanceRaw.toString()));
            } catch (DateTimeParseException e) {
                return ResponseEntity.badRequest().body(Map.of("error",
                        "Format de date d'échéance invalide (attendu ISO-8601, ex. 2026-07-14T10:00:00)"));
            }
        }

        Long contactId;
        Long dealId;
        try {
            contactId = payload.get("contactId") != null
                    ? Long.valueOf(payload.get("contactId").toString()) : null;
            dealId = payload.get("dealId") != null
                    ? Long.valueOf(payload.get("dealId").toString()) : null;
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "contactId/dealId invalide"));
        }

        CurrentPrincipal principal = currentUserService.resolve(jwt);
        return ResponseEntity.ok(activiteService.creer(activite, contactId, dealId, principal));
    }

    // ── Changer le statut ─────────────────────────────────────────────────────
    @PutMapping("/{id}/statut")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CLIENT')")
    public ResponseEntity<Activite> changerStatut(
            @PathVariable Long id,
            @RequestParam StatutActivite statut,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(activiteService.changerStatut(id, statut, currentUserService.resolve(jwt)));
    }

    // ── Supprimer ─────────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','CLIENT')")
    public ResponseEntity<Void> supprimer(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        activiteService.supprimer(id, currentUserService.resolve(jwt));
        return ResponseEntity.noContent().build();
    }

    // ── Stats ─────────────────────────────────────────────────────────────────
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CLIENT')")
    public ResponseEntity<Map<String, Long>> getStats(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(activiteService.getStats(currentUserService.resolve(jwt)));
    }
}