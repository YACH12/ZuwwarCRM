package com.mailinbox.crm_service.service;

import com.mailinbox.crm_service.entity.Activite;
import com.mailinbox.crm_service.entity.Contact;
import com.mailinbox.crm_service.entity.Deal;
import com.mailinbox.crm_service.enums.PrioriteActivite;
import com.mailinbox.crm_service.enums.StatutActivite;
import com.mailinbox.crm_service.enums.TypeActivite;
import com.mailinbox.crm_service.exception.NotFoundException;
import com.mailinbox.crm_service.repository.ActiviteRepository;
import com.mailinbox.crm_service.repository.ContactRepository;
import com.mailinbox.crm_service.repository.DealRepository;
import com.mailinbox.crm_service.security.CurrentPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActiviteService {

    private final ActiviteRepository activiteRepository;
    private final ContactRepository  contactRepository;
    private final DealRepository     dealRepository;

    public Page<Activite> getAll(Pageable pageable, CurrentPrincipal principal) {
        if (principal.isClient()) {
            return activiteRepository.findAllByClientIdOrderByDateCreationDesc(principal.client().getId(), pageable);
        }
        return activiteRepository.findAllByOrderByDateCreationDesc(pageable);
    }

    public List<Activite> getByContact(Long contactId, CurrentPrincipal principal) {
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new NotFoundException("Contact non trouvé : " + contactId));
        assertContactVisible(contact, principal);
        return activiteRepository.findByContactIdOrderByDateCreationDesc(contactId);
    }

    public List<Activite> getByDeal(Long dealId, CurrentPrincipal principal) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new NotFoundException("Deal introuvable : " + dealId));
        assertDealVisible(deal, principal);
        return activiteRepository.findByDealIdOrderByDateCreationDesc(dealId);
    }

    public List<Activite> getTachesAFaire(CurrentPrincipal principal) {
        if (principal.isClient()) {
            return activiteRepository.findByClientIdAndStatutOrderByDateEcheanceAsc(
                    principal.client().getId(), StatutActivite.A_FAIRE);
        }
        return activiteRepository.findByStatutOrderByDateEcheanceAsc(StatutActivite.A_FAIRE);
    }

    private void assertContactVisible(Contact contact, CurrentPrincipal principal) {
        if (principal.isClient()
                && (contact.getClientId() == null || !contact.getClientId().equals(principal.client().getId()))) {
            throw new NotFoundException("Contact non trouvé : " + contact.getId());
        }
    }

    private void assertDealVisible(Deal deal, CurrentPrincipal principal) {
        if (principal.isClient()
                && (deal.getClientId() == null || !deal.getClientId().equals(principal.client().getId()))) {
            throw new NotFoundException("Deal introuvable : " + deal.getId());
        }
    }

    private void assertActiviteVisible(Activite activite, CurrentPrincipal principal) {
        if (principal.isClient()
                && (activite.getClientId() == null || !activite.getClientId().equals(principal.client().getId()))) {
            throw new NotFoundException("Activité introuvable : " + activite.getId());
        }
    }

    @Transactional
    public Activite creer(Activite activiteData, Long contactId, Long dealId, CurrentPrincipal principal) {
        if (contactId != null) {
            Contact contact = contactRepository.findById(contactId)
                    .orElseThrow(() -> new NotFoundException("Contact non trouvé : " + contactId));
            assertContactVisible(contact, principal);
            activiteData.setContact(contact);
        }
        if (dealId != null) {
            Deal deal = dealRepository.findById(dealId)
                    .orElseThrow(() -> new NotFoundException("Deal introuvable : " + dealId));
            assertDealVisible(deal, principal);
            activiteData.setDeal(deal);
        }
        if (principal.isClient()) {
            activiteData.setClientId(principal.client().getId());
        }
        return activiteRepository.save(activiteData);
    }

    // Événement système déclenché en interne par d'autres services (déjà dans un contexte
    // validé) — n'a pas besoin d'un CurrentPrincipal, hérite le tenant du contact/deal lié.
    @Transactional
    public Activite creerEvenementSysteme(String titre, Long contactId, Long dealId) {
        Activite evt = new Activite();
        evt.setType(TypeActivite.SYSTEME);
        evt.setTitre(titre);
        evt.setStatut(StatutActivite.TERMINEE);
        evt.setPriorite(PrioriteActivite.BASSE);
        evt.setCreePar("SYSTÈME");
        evt.setRoleCreateur("SYSTEME");

        if (contactId != null) {
            contactRepository.findById(contactId).ifPresent(c -> {
                evt.setContact(c);
                evt.setClientId(c.getClientId());
            });
        }
        if (dealId != null) {
            dealRepository.findById(dealId).ifPresent(d -> {
                evt.setDeal(d);
                if (evt.getClientId() == null) evt.setClientId(d.getClientId());
            });
        }

        return activiteRepository.save(evt);
    }

    @Transactional
    public Activite changerStatut(Long id, StatutActivite nouveauStatut, CurrentPrincipal principal) {
        Activite activite = activiteRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Activité introuvable : " + id));
        assertActiviteVisible(activite, principal);
        activite.setStatut(nouveauStatut);
        return activiteRepository.save(activite);
    }

    @Transactional
    public void supprimer(Long id, CurrentPrincipal principal) {
        Activite activite = activiteRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Activité introuvable : " + id));
        assertActiviteVisible(activite, principal);
        activiteRepository.delete(activite);
    }

    // ── NOUVEAU : supprimer toutes les activités liées à un deal ────────────
    @Transactional
    public void deleteByDealId(Long dealId) {
        List<Activite> activites = activiteRepository.findByDealIdOrderByDateCreationDesc(dealId);
        activiteRepository.deleteAll(activites);
        log.info("Suppression de {} activité(s) liée(s) au deal {}", activites.size(), dealId);
    }

    public Map<String, Long> getStats(CurrentPrincipal principal) {
        if (principal.isClient()) {
            Long clientId = principal.client().getId();
            return Map.of(
                    "totalActivites",   activiteRepository.countByClientId(clientId),
                    "tachesAFaire",     activiteRepository.countByStatutAndClientId(StatutActivite.A_FAIRE, clientId),
                    "tachesEnCours",    activiteRepository.countByStatutAndClientId(StatutActivite.EN_COURS, clientId),
                    "tachesTerminees",  activiteRepository.countByStatutAndClientId(StatutActivite.TERMINEE, clientId),
                    "notes",            activiteRepository.countByTypeAndClientId(TypeActivite.NOTE, clientId),
                    "evenementsSystem", activiteRepository.countByTypeAndClientId(TypeActivite.SYSTEME, clientId)
            );
        }
        return Map.of(
                "totalActivites",   activiteRepository.count(),
                "tachesAFaire",     activiteRepository.countByStatut(StatutActivite.A_FAIRE),
                "tachesEnCours",    activiteRepository.countByStatut(StatutActivite.EN_COURS),
                "tachesTerminees",  activiteRepository.countByStatut(StatutActivite.TERMINEE),
                "notes",            activiteRepository.countByType(TypeActivite.NOTE),
                "evenementsSystem", activiteRepository.countByType(TypeActivite.SYSTEME)
        );
    }
}