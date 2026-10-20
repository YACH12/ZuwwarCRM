
package com.mailinbox.crm_service.service;

import com.mailinbox.crm_service.exception.NotFoundException;
import com.mailinbox.crm_service.exception.UserAlreadyExistsException;
import com.mailinbox.crm_service.exception.ValidationException;
import com.mailinbox.crm_service.dto.UserCreateRequest;
import com.mailinbox.crm_service.entity.User;
import com.mailinbox.crm_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final KeycloakAdminService keycloakAdminService;

    @Transactional(readOnly = true)
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User non trouvé : " + id));
    }

    @Transactional(readOnly = true)
    public User getUserByKeycloakId(String keycloakId) {
        return userRepository.findByIDkeyclock(keycloakId)
                .orElseThrow(() -> new NotFoundException("Aucun profil CRM lié à ce compte connecté"));
    }

    @Transactional
    public User createUser(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Un utilisateur avec l'email " + request.getEmail() + " existe déjà");
        }
        String keycloakRole = request.getRole().name().toUpperCase();
        String keycloakId = keycloakAdminService.creerUtilisateurAvecRole(
            request.getEmail(), request.getPrenom(), request.getNom(), request.getPassword(), keycloakRole, request.isEnabled()
        );
        User user = User.builder()
            .email(request.getEmail())
            .nom(request.getNom())
            .prenom(request.getPrenom())
            .role(request.getRole())
            .IDkeyclock(keycloakId)
            .enabled(request.isEnabled())
            .build();
        return userRepository.save(user);
    }

    // H3 — un changement de rôle doit être répercuté sur le rôle realm Keycloak de
    // l'utilisateur, sinon son prochain JWT continuerait à porter l'ancien rôle : la table
    // "users" et Keycloak divergeraient silencieusement (ex. un ADMIN rétrogradé en Keycloak
    // resterait ADMIN côté applicatif, ou l'inverse selon le sens de la divergence).
    @Transactional
    public User updateUser(Long id, User request) {
        User user = getUserById(id);
        boolean changementRole = request.getRole() != null && request.getRole() != user.getRole();

        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail());
        user.setEnabled(request.isEnabled());

        if (changementRole) {
            if (user.getIDkeyclock() == null) {
                throw new ValidationException(
                        "Impossible de changer le rôle : aucun compte Keycloak associé à cet utilisateur");
            }
            try {
                keycloakAdminService.mettreAJourRole(user.getIDkeyclock(), request.getRole().name().toUpperCase());
            } catch (Exception e) {
                log.error("Échec de synchronisation du rôle Keycloak pour l'utilisateur {} : {}",
                        user.getId(), e.getMessage(), e);
                throw new ValidationException(
                        "Échec de synchronisation du rôle avec Keycloak — le rôle n'a pas été modifié");
            }
            user.setRole(request.getRole());
        }

        return userRepository.save(user);
    }

    @Transactional
    public User updatePhoto(Long id, String photoUrl) {
        User user = getUserById(id);
        user.setPhotoUrl(photoUrl);
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = getUserById(id);
        if (user.getIDkeyclock() != null) {
            keycloakAdminService.supprimerUtilisateur(user.getIDkeyclock());
        }
        userRepository.delete(user);
    }

}