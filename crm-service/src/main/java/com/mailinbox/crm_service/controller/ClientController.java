package com.mailinbox.crm_service.controller;

import com.mailinbox.crm_service.dto.ClientResponseDTO;
import com.mailinbox.crm_service.dto.PhotoUpdateRequest;
import com.mailinbox.crm_service.entity.Client;
import com.mailinbox.crm_service.enums.StatutClient;
import com.mailinbox.crm_service.service.ClientService;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;
    private final Validator validator;

    @PostMapping("/api/clients/register")
    public ResponseEntity<Map<String, Object>> inscrire(
            @RequestBody Map<String, Object> payload,
            @RequestParam String planId) {

        Client client = new Client();
        client.setNom((String) payload.get("nom"));
        client.setPrenom((String) payload.get("prenom"));
        client.setEmail((String) payload.get("email"));
        client.setTelephone((String) payload.get("telephone"));
        client.setNomEntreprise((String) payload.get("nomEntreprise"));
        client.setPays((String) payload.get("pays"));
        client.setOccupation((String) payload.get("occupation"));

      
        Set<ConstraintViolation<Client>> violations = validator.validate(client);
        if (!violations.isEmpty()) {
            String message = violations.stream()
                    .map(ConstraintViolation::getMessage)
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest().body(Map.of("error", message));
        }

        String motDePasse = (String) payload.get("password");
        if (motDePasse == null || motDePasse.length() < 8) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Le mot de passe doit contenir au moins 8 caractères"));
        }

        String visitorId = (String) payload.get("visitorId");
        Client saved = clientService.inscrire(client, planId, motDePasse, visitorId);

        return ResponseEntity.ok(Map.of(
                "message",  "Compte créé avec succès",
                "clientId", saved.getId(),
                "email",    saved.getEmail(),
                "plan",     saved.getPlanTier().getCode(),
                "statut",   saved.getStatut()
        ));
    }

    @GetMapping("/api/plans")
    public ResponseEntity<?> getPlans() {
        return ResponseEntity.ok(clientService.getPlansActifs());
    }

    @GetMapping("/api/clients/verify-email")
    public ResponseEntity<Map<String, Object>> verifierEmail(@RequestParam String token) {
        boolean ok = clientService.verifierEmail(token);
        if (!ok) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Lien de vérification invalide ou expiré"));
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Email vérifié avec succès"));
    }

    @GetMapping("/clients")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Page<ClientResponseDTO>> getAll(Pageable pageable) {
        return ResponseEntity.ok(clientService.getAll(pageable).map(ClientResponseDTO::from));
    }

    @GetMapping("/clients/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ClientResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ClientResponseDTO.from(clientService.getById(id)));
    }

    @GetMapping("/clients/plan/{planId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Page<ClientResponseDTO>> getByPlan(
            @PathVariable String planId, Pageable pageable) {
        return ResponseEntity.ok(clientService.getByPlan(planId, pageable).map(ClientResponseDTO::from));
    }

    @GetMapping("/clients/statut/{statut}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Page<ClientResponseDTO>> getByStatut(
            @PathVariable StatutClient statut, Pageable pageable) {
        return ResponseEntity.ok(clientService.getByStatut(statut, pageable).map(ClientResponseDTO::from));
    }

    @PutMapping("/clients/{id}/plan")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Map<String, Object>> changerPlan(
            @PathVariable Long id, @RequestParam String planId) {
        Client updated = clientService.changerPlan(id, planId);
        return ResponseEntity.ok(Map.of(
                "message", "Plan mis à jour",
                "plan",    updated.getPlanTier().getCode(),
                "statut",  updated.getStatut()
        ));
    }

    @PutMapping("/clients/{id}/suspendre")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Map<String, Object>> suspendre(@PathVariable Long id) {
        Client client = clientService.suspendre(id);
        return ResponseEntity.ok(Map.of("message", "Client suspendu", "statut", client.getStatut()));
    }

    @PutMapping("/clients/{id}/reactiver")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Map<String, Object>> reactiver(@PathVariable Long id) {
        Client client = clientService.reactiver(id);
        return ResponseEntity.ok(Map.of("message", "Client réactivé", "statut", client.getStatut()));
    }

    @PutMapping("/clients/{id}/photo")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ClientResponseDTO> updatePhoto(@PathVariable Long id,
                                                          @RequestBody PhotoUpdateRequest request) {
        return ResponseEntity.ok(ClientResponseDTO.from(clientService.updatePhoto(id, request.photoUrl())));
    }

    @DeleteMapping("/clients/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        clientService.supprimer(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/clients/{id}/score/recalculate")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Map<String, Object>> recalculerScore(@PathVariable Long id) {
        try {
            var client = clientService.recalculerScore(id);
            return ResponseEntity.ok(Map.of(
                "clientId", client.getId(),
                "scoreIA",  client.getScoreIA()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(503).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/clients/update-all-scores")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Map<String, Object>> recalculerTousLesScores() {
        return ResponseEntity.ok(clientService.recalculerTousLesScores());
    }

    @GetMapping("/clients/stats")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(clientService.getStats());
    }
}
