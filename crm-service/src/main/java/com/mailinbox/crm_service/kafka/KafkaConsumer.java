package com.mailinbox.crm_service.kafka;

import com.mailinbox.crm_service.entity.Client;
import com.mailinbox.crm_service.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaConsumer {

    private final ClientRepository clientRepository;

    @KafkaListener(
        topics  = "lead-scoring-result",
        groupId = "crm-service-group"
    )
    public void recevoirScore(Map<String, Object> event) {
        try {
            Long   clientId = Long.valueOf(event.get("contactId").toString());
            Double scoreIA  = Double.valueOf(event.get("scoreIA").toString());

            Client client = clientRepository.findById(clientId)
                    .orElseThrow(() -> new RuntimeException("Client introuvable : " + clientId));

            client.setScoreIA(scoreIA);
            clientRepository.save(client);

            log.info("✅ Score IA persisté — Client {} | {}%", clientId, scoreIA);

        } catch (Exception e) {
            log.error("❌ Erreur persistance score : {}", e.getMessage(), e);
        }
    }
}
