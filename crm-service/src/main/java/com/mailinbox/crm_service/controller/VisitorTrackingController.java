package com.mailinbox.crm_service.controller;

import com.mailinbox.crm_service.service.VisitorTrackingService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Suivi comportemental des visiteurs anonymes (landing/signup), avant inscription.
 * Public (couvert par /api/tracking/** dans SecurityConfig) car appelé par des
 * visiteurs non authentifiés.
 */
@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
public class VisitorTrackingController {

    private final VisitorTrackingService trackingService;

    @PostMapping("/visitor/heartbeat")
    public ResponseEntity<?> heartbeat(@RequestBody HeartbeatPayload payload) {
        if (payload.getVisitorId() == null || payload.getVisitorId().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "visitorId requis"));
        }
        trackingService.recordHeartbeat(
                payload.getVisitorId(),
                payload.getDeltaSeconds(),
                payload.getDeltaPageViews(),
                payload.isNewVisit(),
                payload.getUtmSource(),
                payload.getUtmCampaign()
        );
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @Data
    public static class HeartbeatPayload {
        private String visitorId;
        private double deltaSeconds;
        private int deltaPageViews;
        private boolean newVisit;
        private String utmSource;
        private String utmCampaign;
    }
}
