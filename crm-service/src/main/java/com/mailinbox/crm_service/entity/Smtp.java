package com.mailinbox.crm_service.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter @Setter
@Entity
@Table(name = "smtp_config")
public class Smtp{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // null = SMTP plateforme (fallback staff + clients sans smtpPersonnalise), non null = SMTP propre à un tenant
    @Column(name = "client_id")
    private Long clientId;

    @NotBlank(message = "L'hôte SMTP est obligatoire")
    @Column(nullable = false)
    private String host;

    @NotNull(message = "Le port SMTP est obligatoire")
    @Min(value = 1, message = "Le port doit être compris entre 1 et 65535")
    @Max(value = 65535, message = "Le port doit être compris entre 1 et 65535")
    @Column(nullable = false)
    private Integer port;

    @NotBlank(message = "Le nom d'utilisateur SMTP est obligatoire")
    @Column(nullable = false)
    private String username;

    // Ne jamais renvoyer le mot de passe (même chiffré) dans les réponses API — accepté en
    // entrée (désérialisation) mais toujours omis en sortie (sérialisation).
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @NotBlank(message = "Le mot de passe SMTP est obligatoire")
    @Column(nullable = false)
    private String password;

    private boolean active = false;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}