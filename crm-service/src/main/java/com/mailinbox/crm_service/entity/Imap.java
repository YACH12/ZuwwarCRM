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
@Table(name = "imap_config")
public class Imap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // null = IMAP plateforme (fallback staff + clients sans IMAP personnalisé), non null = IMAP propre à un tenant
    @Column(name = "client_id")
    private Long clientId;

    @NotBlank(message = "L'hôte IMAP est obligatoire")
    @Column(nullable = false)
    private String host;

    @NotNull(message = "Le port IMAP est obligatoire")
    @Min(value = 1, message = "Le port doit être compris entre 1 et 65535")
    @Max(value = 65535, message = "Le port doit être compris entre 1 et 65535")
    @Column(nullable = false)
    private Integer port;

    @NotBlank(message = "Le nom d'utilisateur IMAP est obligatoire")
    @Column(nullable = false)
    private String username;

    // Ne jamais renvoyer le mot de passe (même chiffré) dans les réponses API — accepté en
    // entrée (désérialisation) mais toujours omis en sortie (sérialisation).
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @NotBlank(message = "Le mot de passe IMAP est obligatoire")
    @Column(nullable = false)
    private String password;

    private boolean active = false;

    // Dernier UID IMAP traité dans cette boîte — indépendant du flag \Seen (qui peut être
    // modifié par n'importe quel autre client mail, ex: en ouvrant l'email dans Gmail).
    private Long lastUid;

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
