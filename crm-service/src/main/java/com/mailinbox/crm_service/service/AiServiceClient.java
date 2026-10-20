package com.mailinbox.crm_service.service;

import com.mailinbox.crm_service.entity.Client;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class AiServiceClient {

    // Catégories "Last Activity" connues du modèle XGBoost.
    // "Website" seul n'existe pas dans le jeu d'entraînement -> erreur 500 côté IA.
    private static final String LAST_ACTIVITY_ACTIF  = "Page Visited on Website";
    private static final String LAST_ACTIVITY_DEFAUT = "Email Opened";

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public double calculerScoreClient(Client client) {
        Map<String, Object> payload = buildClientPayload(client);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiServiceUrl + "/api/scoring/predict", request, Map.class);
            Map<?, ?> body = response.getBody();
            if (body == null) throw new RuntimeException("Réponse vide du service IA");
            return ((Number) body.get("scoreIA")).doubleValue();
        } catch (Exception e) {
            log.error("Erreur scoring client {} : {}", client.getId(), e.getMessage());
            throw new RuntimeException("Service IA indisponible : " + e.getMessage());
        }
    }

    public Map<String, Object> classifierTexte(String texte) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("texte", texte);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiServiceUrl + "/api/nlp/classifier", request, Map.class);
            Map<?, ?> body = response.getBody();
            if (body == null) throw new RuntimeException("Réponse vide du service IA");
            @SuppressWarnings("unchecked")
            Map<String, Object> result = (Map<String, Object>) body;
            return result;
        } catch (Exception e) {
            log.error("Erreur classification NLP : {}", e.getMessage());
            throw new RuntimeException("Service IA (NLP) indisponible : " + e.getMessage());
        }
    }

    private Map<String, Object> buildClientPayload(Client client) {
        double temps   = client.getTempsPasseSite() > 0 ? client.getTempsPasseSite() : 50.0;
        double visites = client.getNombreVisites()  > 0 ? client.getNombreVisites()  : 1.0;
        double pages   = client.getPagesVues()      > 0 ? (double) client.getPagesVues() / visites : 1.0;

        String source = "Landing Page Submission";
        if (client.getSource() != null) {
            source = switch (client.getSource()) {
                case "Organic Search", "organic" -> "Organic Search";
                case "API", "api"                -> "API";
                case "Referral", "referral"      -> "Reference";
                default                          -> "Direct Traffic";
            };
        }

        // CORRIGÉ : "Website" -> "Page Visited on Website"
        String activity = switch (client.getStatut()) {
            case ACTIF    -> LAST_ACTIVITY_ACTIF;
            case ESSAI    -> LAST_ACTIVITY_DEFAUT;
            case PROSPECT -> LAST_ACTIVITY_DEFAUT;
            default       -> LAST_ACTIVITY_DEFAUT;
        };

        Map<String, Object> map = new HashMap<>();
        map.put("total_time_spent",     temps);
        map.put("total_visits",         visites);
        map.put("page_views_per_visit", pages);
        map.put("last_activity",        activity);
        map.put("lead_origin",          "Landing Page Submission");
        map.put("lead_source",          source);
        map.put("occupation",           client.getOccupation() != null && !client.getOccupation().isBlank()
                                             ? client.getOccupation() : "unknown");
        return map;
    }
}