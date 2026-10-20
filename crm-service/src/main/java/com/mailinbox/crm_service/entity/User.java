package com.mailinbox.crm_service.entity;
import java.time.LocalDateTime;

import com.mailinbox.crm_service.enums.UserRole;


import jakarta.persistence.*;
import lombok.*;

@Table(name="users")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity

public class User{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
     private Long id;

    @Column(unique = true,  nullable=false)
    private String email;

    @Column(nullable=false)
    private String nom ;

    @Column(nullable=false)
    private String prenom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;
    

    @Column(updatable = false)
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
    
    @Column(unique=true, nullable=false)
    private String IDkeyclock;

    @Builder.Default
    @Column(nullable = false)
    private boolean enabled=true;

    @Column(columnDefinition = "TEXT")
    private String photoUrl;







}