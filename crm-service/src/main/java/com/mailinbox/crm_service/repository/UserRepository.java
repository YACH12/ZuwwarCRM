package com.mailinbox.crm_service.repository;


import com.mailinbox.crm_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.IDkeyclock = :idKeyclock")
    Optional<User> findByIDkeyclock(@Param("idKeyclock") String idKeyclock);

}