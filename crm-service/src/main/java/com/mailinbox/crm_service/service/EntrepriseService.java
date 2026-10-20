package com.mailinbox.crm_service.service;

import com.mailinbox.crm_service.entity.Entreprise;
import com.mailinbox.crm_service.exception.NotFoundException;
import com.mailinbox.crm_service.exception.ValidationException;
import com.mailinbox.crm_service.repository.EntrepriseRepository;
import com.mailinbox.crm_service.security.CurrentPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EntrepriseService {

    private final EntrepriseRepository entrepriseRepository;

    public Page<Entreprise> getAll(Pageable pageable, CurrentPrincipal principal) {
        if (principal.isClient()) {
            return entrepriseRepository.findAllByClientId(principal.client().getId(), pageable);
        }
        return entrepriseRepository.findAll(pageable);
    }

    public Entreprise getById(Long id, CurrentPrincipal principal) {
        Entreprise entreprise = fetchOrThrow(id);
        assertVisible(entreprise, principal);
        return entreprise;
    }

    /** Utilisé par d'autres services (ex: ContactService) pour valider l'appartenance sans lever 404 générique du getById public. */
    public Entreprise fetchOrThrow(Long id) {
        return entrepriseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Entreprise introuvable : " + id));
    }

    public void assertVisible(Entreprise entreprise, CurrentPrincipal principal) {
        if (principal.isClient()
                && (entreprise.getClientId() == null || !entreprise.getClientId().equals(principal.client().getId()))) {
            throw new NotFoundException("Entreprise introuvable : " + entreprise.getId());
        }
    }

    @Transactional
    public Entreprise create(Entreprise entreprise, CurrentPrincipal principal) {
        boolean emailExists = principal.isClient()
                ? entrepriseRepository.existsByEmailAndClientId(entreprise.getEmail(), principal.client().getId())
                : entrepriseRepository.existsByEmailAndClientIdIsNull(entreprise.getEmail());
        if (emailExists) {
            throw new ValidationException("Email déjà utilisé : " + entreprise.getEmail());
        }
        if (principal.isClient()) {
            entreprise.setClientId(principal.client().getId());
        }
        return entrepriseRepository.save(entreprise);
    }

    @Transactional
    public Entreprise update(Long id, Entreprise request, CurrentPrincipal principal) {
        Entreprise entreprise = fetchOrThrow(id);
        assertVisible(entreprise, principal);
        entreprise.setNom(request.getNom());
        entreprise.setEmail(request.getEmail());
        entreprise.setTelephone(request.getTelephone());
        entreprise.setAdresse(request.getAdresse());
        entreprise.setSecteur(request.getSecteur());
        entreprise.setSiteWeb(request.getSiteWeb());
        entreprise.setTaille(request.getTaille());
        return entrepriseRepository.save(entreprise);
    }

    @Transactional
    public void delete(Long id, CurrentPrincipal principal) {
        Entreprise entreprise = fetchOrThrow(id);
        assertVisible(entreprise, principal);
        entrepriseRepository.delete(entreprise);
    }
}