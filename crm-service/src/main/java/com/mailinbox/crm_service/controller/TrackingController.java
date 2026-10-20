package com.mailinbox.crm_service.controller;

import com.mailinbox.crm_service.entity.Contact;
import com.mailinbox.crm_service.repository.ContactRepository;
import com.mailinbox.crm_service.repository.EmailTrackingRepository;
import com.mailinbox.crm_service.service.EngagementScoringService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
public class TrackingController {

    private final ContactRepository contactRepository;
    private final EmailTrackingRepository emailTrackingRepository;
    private final EngagementScoringService engagementScoringService;

    @Value("${app.frontend-url:http://localhost:4200}")
    private String frontendUrl;

    private static final byte[] PIXEL_GIF = {
        0x47,0x49,0x46,0x38,0x39,0x61,0x01,0x00,0x01,0x00,(byte)0x80,0x00,0x00,
        (byte)0xFF,(byte)0xFF,(byte)0xFF,0x00,0x00,0x00,0x21,(byte)0xF9,0x04,
        0x01,0x00,0x00,0x00,0x00,0x2C,0x00,0x00,0x00,0x00,0x01,0x00,0x01,0x00,
        0x00,0x02,0x02,0x44,0x01,0x00,0x3B
    };

    @GetMapping("/open/{token}")
    public ResponseEntity<byte[]> pixelOuverture(@PathVariable String token) {
        emailTrackingRepository.findByToken(token).ifPresent(tracking -> {
            if (!tracking.getOuvert()) {
                tracking.setOuvert(true);
                tracking.setOuvertAt(LocalDateTime.now());
                emailTrackingRepository.save(tracking);

                Contact contact = tracking.getContact();
                if (contact != null) {
                    engagementScoringService.onEmailOpened(contact);
                    System.out.println("📧 Email ouvert par : " + contact.getEmail() + " → score d'engagement mis à jour");
                }
            }
        });

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_GIF);
        headers.setCacheControl("no-cache, no-store, must-revalidate");
        return ResponseEntity.ok().headers(headers).body(PIXEL_GIF);
    }

   
    @GetMapping("/click/{token}")
    public ResponseEntity<Void> pixelClic(@PathVariable String token, @RequestParam String url) {
        Optional<com.mailinbox.crm_service.entity.EmailTracking> trackingOpt = emailTrackingRepository.findByToken(token);

    
        boolean autorisee = urlValide(url) && trackingOpt.isPresent() && urlAutorisee(trackingOpt.get(), url);
        URI destination = autorisee ? URI.create(url) : URI.create(frontendUrl);

        trackingOpt.ifPresent(tracking -> {
            if (!tracking.getClique()) {
                tracking.setClique(true);
                tracking.setCliqueAt(LocalDateTime.now());
                if (autorisee) {
                    tracking.setUrlCliquee(url);
                }
                emailTrackingRepository.save(tracking);

                Contact contact = tracking.getContact();
                if (contact != null) {
                    engagementScoringService.onLinkClicked(contact);
                }
            }
        });

        return ResponseEntity.status(HttpStatus.FOUND).location(destination).build();
    }

    private boolean urlValide(String url) {
        try {
            URI uri = URI.create(url);
            String schema = uri.getScheme();
            return "http".equalsIgnoreCase(schema) || "https".equalsIgnoreCase(schema);
        } catch (Exception e) {
            return false;
        }
    }

  
    private boolean urlAutorisee(com.mailinbox.crm_service.entity.EmailTracking tracking, String url) {
        String allowed = tracking.getAllowedUrls();
        if (allowed == null || allowed.isBlank()) {
            return false;
        }
        for (String candidate : allowed.split("\\|")) {
            if (candidate.equals(url)) {
                return true;
            }
        }
        return false;
    }

    @PostMapping("/collect")
    public ResponseEntity<?> recevoirTracking(@RequestBody TrackingPayload payload) {

        Optional<Contact> contactOpt = contactRepository.findByEmail(payload.getEmail());

        if (contactOpt.isEmpty()) {
            return ResponseEntity.status(404).body(
                Map.of("error", "Contact introuvable avec l'email : " + payload.getEmail())
            );
        }

        Contact contact = contactOpt.get();

        engagementScoringService.onWebsiteVisit(contact);

        System.out.println("Tracking reçu pour : " + contact.getEmail() +
            " | Time: " + payload.getTotal_time_spent() +
            "s | Pages: " + payload.getPage_views_per_visit() +
            " | Visits: " + payload.getTotal_visits());

        return ResponseEntity.ok(Map.of(
            "message",   "Tracking reçu — score d'engagement mis à jour",
            "contactId", contact.getId(),
            "email",     contact.getEmail()
        ));
    }
}

@Data
class TrackingPayload {
    private String email;
    private double total_time_spent;
    private double page_views_per_visit;
    private double total_visits;
}