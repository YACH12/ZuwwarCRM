package com.mailinbox.crm_service.entity;

import java.time.LocalDateTime;

import com.mailinbox.crm_service.enums.RoleType;

import jakarta.persistence.*;
import lombok.*;
@Getter @Setter

@Entity
public class Template {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // null = template système partagé (lecture seule pour les Clients), non null = tenant propriétaire
    @Column(name = "client_id")
    private Long clientId;

    @Column(nullable = false)
    private String nom;

    @Column
    private String subject;

    @Column(nullable = false, columnDefinition="TEXT")
    private String htmlContent;

    @Column(nullable = false, columnDefinition="TEXT")
    private String textContent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleType type;
    

    @Column(updatable = true)
    private LocalDateTime creatAt;
    private LocalDateTime updateAt;

    @PrePersist
    protected void oncreate(){
        creatAt=LocalDateTime.now();
    }

    @PreUpdate
    protected void onupdate(){
        updateAt=LocalDateTime.now();
    }













    
}

