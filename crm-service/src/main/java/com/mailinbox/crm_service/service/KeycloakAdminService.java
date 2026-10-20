package com.mailinbox.crm_service.service;

import com.mailinbox.crm_service.exception.UserAlreadyExistsException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.List;
import java.util.Map;

@Service
public class KeycloakAdminService {

    @Value("${keycloak.auth-server-url}")
    private String keycloakUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.admin-client-id}")
    private String adminClientId;

    @Value("${keycloak.admin-client-secret}")
    private String adminClientSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    // ── Obtenir un token admin via le compte de service ───────────────────────
    private String obtenirTokenAdmin() {
        String url = keycloakUrl + "/realms/" + realm + "/protocol/openid-connect/token";

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");
        body.add("client_id", adminClientId);
        body.add("client_secret", adminClientSecret);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
        return (String) response.getBody().get("access_token");
    }

    // ── Créer un utilisateur dans Keycloak (rôle CLIENT par défaut) ──────────
    public String creerUtilisateur(String email, String prenom, String nom, String motDePasse) {
        return creerUtilisateurAvecRole(email, prenom, nom, motDePasse, "CLIENT", true);
    }

    // ── Créer un utilisateur dans Keycloak avec un rôle spécifique ────────────
    public String creerUtilisateurAvecRole(String email, String prenom, String nom, String motDePasse, String roleName, boolean enabled) {
        String tokenAdmin = obtenirTokenAdmin();
        String url = keycloakUrl + "/admin/realms/" + realm + "/users";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(tokenAdmin);

        Map<String, Object> credentials = Map.of(
            "type", "password",
            "value", motDePasse,
            "temporary", false
        );

        Map<String, Object> userPayload = Map.of(
            "username", email,
            "email", email,
            "firstName", prenom,
            "lastName", nom,
            "enabled", enabled,
            "emailVerified", true,
            "credentials", List.of(credentials)
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(userPayload, headers);

        String keycloakId = null;
        try {
            ResponseEntity<Void> response = restTemplate.postForEntity(url, request, Void.class);

            String location = response.getHeaders().getFirst("Location");
            keycloakId = location.substring(location.lastIndexOf("/") + 1);

            assignerRole(tokenAdmin, keycloakId, roleName);

            return keycloakId;

        } catch (HttpClientErrorException.Conflict e) {
            throw new UserAlreadyExistsException("Un utilisateur avec l'email " + email + " existe déjà");
        } catch (Exception e) {
            // L'utilisateur Keycloak a pu être créé avant l'échec (ex. assignation de rôle) :
            // on l'annule pour éviter un compte orphelin qui bloquerait un nouvel essai (409).
            if (keycloakId != null) {
                try {
                    supprimerUtilisateurAvecToken(tokenAdmin, keycloakId);
                } catch (Exception cleanupEx) {
                    // best-effort : on garde l'erreur d'origine, plus parlante
                }
            }
            throw new RuntimeException("Erreur création utilisateur Keycloak : " + e.getMessage());
        }
    }

    // ── Supprimer un utilisateur de Keycloak ──────────────────────────────────
    public void supprimerUtilisateur(String keycloakId) {
        supprimerUtilisateurAvecToken(obtenirTokenAdmin(), keycloakId);
    }

    private void supprimerUtilisateurAvecToken(String tokenAdmin, String keycloakId) {
        String url = keycloakUrl + "/admin/realms/" + realm + "/users/" + keycloakId;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(tokenAdmin);
        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            restTemplate.exchange(url, HttpMethod.DELETE, request, Void.class);
        } catch (Exception e) {
            throw new RuntimeException("Erreur suppression utilisateur Keycloak : " + e.getMessage());
        }
    }

    // Rôles realm gérés par l'application (voir UserRole) — seuls ceux-ci sont retirés lors
    // d'un changement de rôle, pour ne jamais toucher à d'éventuels rôles Keycloak custom.
    private static final List<String> ROLES_GEREES = List.of("ADMIN", "MANAGER", "INTEGRATEUR", "CLIENT");

    // ── H3 : synchronise le rôle realm Keycloak d'un utilisateur déjà existant ───────────
    // Retire les rôles gérés actuellement assignés puis assigne le nouveau, pour que la table
    // "users" (rôle applicatif) et Keycloak (rôle realm, utilisé pour les tokens JWT) ne
    // divergent jamais après un PUT /users/{id}.
    public void mettreAJourRole(String keycloakId, String nouveauRole) {
        String tokenAdmin = obtenirTokenAdmin();
        retirerRolesGeres(tokenAdmin, keycloakId);
        assignerRole(tokenAdmin, keycloakId, nouveauRole.toUpperCase());
    }

    @SuppressWarnings("unchecked")
    private void retirerRolesGeres(String tokenAdmin, String userId) {
        String urlMappings = keycloakUrl + "/admin/realms/" + realm + "/users/" + userId + "/role-mappings/realm";

        HttpHeaders getHeaders = new HttpHeaders();
        getHeaders.setBearerAuth(tokenAdmin);
        HttpEntity<Void> getRequest = new HttpEntity<>(getHeaders);

        ResponseEntity<List> response = restTemplate.exchange(urlMappings, HttpMethod.GET, getRequest, List.class);
        List<Map<String, Object>> rolesActuels = response.getBody();
        if (rolesActuels == null || rolesActuels.isEmpty()) {
            return;
        }

        List<Map<String, Object>> aSupprimer = rolesActuels.stream()
                .filter(r -> ROLES_GEREES.contains(String.valueOf(r.get("name")).toUpperCase()))
                .toList();
        if (aSupprimer.isEmpty()) {
            return;
        }

        HttpHeaders deleteHeaders = new HttpHeaders();
        deleteHeaders.setBearerAuth(tokenAdmin);
        deleteHeaders.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<List<Map<String, Object>>> deleteRequest = new HttpEntity<>(aSupprimer, deleteHeaders);

        restTemplate.exchange(urlMappings, HttpMethod.DELETE, deleteRequest, Void.class);
    }

    // ── Assigner un rôle realm à l'utilisateur ────────────────────────────────
    private void assignerRole(String tokenAdmin, String userId, String roleName) {
        String urlRole = keycloakUrl + "/admin/realms/" + realm + "/roles/" + roleName;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(tokenAdmin);
        HttpEntity<Void> getRequest = new HttpEntity<>(headers);

        ResponseEntity<Map> roleResponse = restTemplate.exchange(
            urlRole, HttpMethod.GET, getRequest, Map.class
        );
        Map roleRepresentation = roleResponse.getBody();

        String urlAssign = keycloakUrl + "/admin/realms/" + realm + "/users/" + userId + "/role-mappings/realm";

        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<List<Map>> assignRequest = new HttpEntity<>(List.of(roleRepresentation), headers);

        restTemplate.postForEntity(urlAssign, assignRequest, Void.class);
    }
}