package com.mailinbox.crm_service.service;

import com.mailinbox.crm_service.entity.VisitorSession;
import com.mailinbox.crm_service.repository.VisitorSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VisitorTrackingService {

    // Bornes hautes d'un seul appel de heartbeat — le front envoie un heartbeat toutes les
    // ~30s ; 300s (5 min) et 20 pages/heartbeat couvrent largement un usage légitime tout en
    // empêchant un appelant d'injecter des valeurs invraisemblables (M4).
    private static final double MAX_DELTA_SECONDS = 300.0;
    private static final int MAX_DELTA_PAGE_VIEWS = 20;

    private final VisitorSessionRepository repository;

    @Transactional
    public void recordHeartbeat(String visitorId, double deltaSeconds, int deltaPageViews,
                                 boolean isNewVisit, String utmSource, String utmCampaign) {
        VisitorSession session = repository.findById(visitorId).orElseGet(() -> {
            VisitorSession s = new VisitorSession();
            s.setVisitorId(visitorId);
            return s;
        });

        double bornedDeltaSeconds = Math.min(Math.max(0, deltaSeconds), MAX_DELTA_SECONDS);
        int bornedDeltaPageViews = Math.min(Math.max(0, deltaPageViews), MAX_DELTA_PAGE_VIEWS);

        session.setTotalTimeSpent(session.getTotalTimeSpent() + bornedDeltaSeconds);
        session.setTotalPageViews(session.getTotalPageViews() + bornedDeltaPageViews);
        if (isNewVisit) {
            session.setTotalVisits(session.getTotalVisits() + 1);
        }
        if (utmSource != null && !utmSource.isBlank()) session.setUtmSource(utmSource);
        if (utmCampaign != null && !utmCampaign.isBlank()) session.setUtmCampaign(utmCampaign);

        repository.save(session);
    }

    @Transactional(readOnly = true)
    public VisitorSession find(String visitorId) {
        if (visitorId == null || visitorId.isBlank()) return null;
        return repository.findById(visitorId).orElse(null);
    }
}
