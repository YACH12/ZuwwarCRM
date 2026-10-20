package com.mailinbox.crm_service.dto;

import com.mailinbox.crm_service.entity.User;

public record UserResponseDTO(
        Long id,
        String email,
        String nom,
        String prenom,
        String role,
        boolean enabled,
        String creatAt,
        String IDkeyclock,
        String photoUrl
) {
    public static UserResponseDTO from(User u) {
        return new UserResponseDTO(
                u.getId(),
                u.getEmail(),
                u.getNom(),
                u.getPrenom(),
                u.getRole() != null ? u.getRole().name() : null,
                u.isEnabled(),
                u.getCreatAt() != null ? u.getCreatAt().toString() : null,
                u.getIDkeyclock(),
                u.getPhotoUrl()
        );
    }
}
