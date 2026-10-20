package com.mailinbox.crm_service.dto;

import com.mailinbox.crm_service.enums.UserRole;
import lombok.Data;

@Data
public class UserCreateRequest {
    private String prenom;
    private String nom;
    private String email;
    private String password;
    private UserRole role;
    private boolean enabled = false;
}
