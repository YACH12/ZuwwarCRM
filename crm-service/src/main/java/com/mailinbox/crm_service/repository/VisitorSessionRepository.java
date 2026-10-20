package com.mailinbox.crm_service.repository;

import com.mailinbox.crm_service.entity.VisitorSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VisitorSessionRepository extends JpaRepository<VisitorSession, String> {
}
