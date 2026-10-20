package com.mailinbox.crm_service.dto;

import com.mailinbox.crm_service.entity.Client;
import com.mailinbox.crm_service.entity.PlanTier;
import com.mailinbox.crm_service.enums.StatutClient;

import java.time.LocalDateTime;

public record ClientResponseDTO(
        Long id,
        String nom,
        String prenom,
        String email,
        String telephone,
        String nomEntreprise,
        String secteur,
        String pays,
        PlanTier planTier,
        StatutClient statut,
        int emailsEnvoyes,
        int contactsUtilises,
        int usersActifs,
        double scoreIA,
        String source,
        boolean emailVerifie,
        LocalDateTime dateInscription,
        LocalDateTime dateExpiration,
        LocalDateTime dateActivation,
        LocalDateTime createdAt,
        String photoUrl
) {
    public static ClientResponseDTO from(Client c) {
        return new ClientResponseDTO(
                c.getId(), c.getNom(), c.getPrenom(), c.getEmail(),
                c.getTelephone(), c.getNomEntreprise(), c.getSecteur(), c.getPays(),
                c.getPlanTier(), c.getStatut(),
                c.getEmailsEnvoyes(), c.getContactsUtilises(), c.getUsersActifs(),
                c.getScoreIA(), c.getSource(), c.isEmailVerifie(),
                c.getDateInscription(), c.getDateExpiration(), c.getDateActivation(),
                c.getCreatedAt(), c.getPhotoUrl()
        );
    }
}
