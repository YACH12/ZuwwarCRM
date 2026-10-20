package com.mailinbox.crm_service.kafka;

import com.mailinbox.crm_service.event.LeadScoringEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    // ── Lead Scoring uniquement — publierEnvoiCampagne supprimé ──────────────
    @Async
    public void publierScoreLead(LeadScoringEvent event) {
        try {
            kafkaTemplate.send("lead-scoring", event.getContactId().toString(), event)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.info("✅ Kafka — Score publié pour contact ID : {}", event.getContactId());
                    } else {
                        log.warn("⚠️ Kafka — Échec publication contact ID {} : {}", event.getContactId(), ex.getMessage());
                    }
                });
        } catch (Exception e) {
            log.warn("⚠️ Kafka indisponible — scoring ignoré pour contact ID {} : {}", event.getContactId(), e.getMessage());
        }
    }
}