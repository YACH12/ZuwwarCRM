package com.mailinbox.crm_service.security;

import com.mailinbox.crm_service.exception.NotFoundException;
import com.mailinbox.crm_service.repository.ClientRepository;
import com.mailinbox.crm_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

/**
 * Résout l'appelant courant à partir du JWT Keycloak : staff en priorité
 * (table users), sinon Client (table client).
 */
@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;

    public CurrentPrincipal resolve(Jwt jwt) {
        String keycloakId = jwt.getSubject();
        return userRepository.findByIDkeyclock(keycloakId)
                .map(CurrentPrincipal::staff)
                .orElseGet(() -> clientRepository.findByKeycloakId(keycloakId)
                        .map(CurrentPrincipal::client)
                        .orElseThrow(() -> new NotFoundException(
                                "Aucun profil CRM (staff ou client) lié à ce compte connecté")));
    }
}
