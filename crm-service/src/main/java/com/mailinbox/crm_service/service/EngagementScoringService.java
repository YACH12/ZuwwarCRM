package com.mailinbox.crm_service.service;

import com.mailinbox.crm_service.entity.Contact;
import com.mailinbox.crm_service.entity.EmailTracking;
import com.mailinbox.crm_service.enums.RoleleadStage;
import com.mailinbox.crm_service.exception.NotFoundException;
import com.mailinbox.crm_service.repository.ContactRepository;
import com.mailinbox.crm_service.repository.EmailTrackingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Score d'engagement simple pour les Contacts — aucun appel externe/AI.
 * Barème : ouverture email +10, clic +20, visite site +5, plafond 100, plancher 0.
 * Désabonnement/bounce remettent le score à 0.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EngagementScoringService {

    private static final double POINTS_OUVERTURE = 10.0;
    private static final double POINTS_CLIC       = 20.0;
    private static final double POINTS_VISITE     = 5.0;
    private static final double SCORE_MAX         = 100.0;
    private static final double SCORE_MIN         = 0.0;
    private static final double DECROISSANCE_JOURNALIERE = 5.0;
    private static final long   JOURS_INACTIVITE_AVANT_DECROISSANCE = 14;

    private final ContactRepository contactRepository;
    private final EmailTrackingRepository emailTrackingRepository;

    @Transactional
    public void onEmailOpened(Contact contact) {
        appliquerDelta(contact, POINTS_OUVERTURE);
    }

    @Transactional
    public void onLinkClicked(Contact contact) {
        appliquerDelta(contact, POINTS_CLIC);
    }

    @Transactional
    public void onWebsiteVisit(Contact contact) {
        appliquerDelta(contact, POINTS_VISITE);
    }

    @Transactional
    public void onUnsubscribed(Contact contact) {
        contact.setScoreEngagement(SCORE_MIN);
        contact.setLeadStage(RoleleadStage.New);
        contactRepository.save(contact);
    }

    @Transactional
    public Contact recalculerDepuisHistorique(Long contactId) {
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new NotFoundException("Contact non trouvé : " + contactId));

        List<EmailTracking> trackings = emailTrackingRepository.findByContactId(contactId);
        double score = SCORE_MIN;
        LocalDateTime derniereActivite = null;

        for (EmailTracking t : trackings) {
            if (Boolean.TRUE.equals(t.getOuvert())) {
                score += POINTS_OUVERTURE;
                derniereActivite = plusRecent(derniereActivite, t.getOuvertAt());
            }
            if (Boolean.TRUE.equals(t.getClique())) {
                score += POINTS_CLIC;
                derniereActivite = plusRecent(derniereActivite, t.getCliqueAt());
            }
            if (t.getTotalVisites() != null && t.getTotalVisites() > 0) {
                score += POINTS_VISITE * t.getTotalVisites();
            }
            if (Boolean.TRUE.equals(t.getDesabonne()) || Boolean.TRUE.equals(t.getRebondi())) {
                score = SCORE_MIN;
            }
        }

        score = Math.max(SCORE_MIN, Math.min(SCORE_MAX, score));
        contact.setScoreEngagement(score);
        contact.setDerniereActiviteEngagement(derniereActivite);
        contact.setLeadStage(leadStagePour(score));
        return contactRepository.save(contact);
    }

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void decroissanceQuotidienne() {
        LocalDateTime seuil = LocalDateTime.now().minusDays(JOURS_INACTIVITE_AVANT_DECROISSANCE);
        List<Contact> inactifs = contactRepository.findInactifsAvecScore(seuil);
        for (Contact contact : inactifs) {
            double nouveauScore = Math.max(SCORE_MIN, contact.getScoreEngagement() - DECROISSANCE_JOURNALIERE);
            contact.setScoreEngagement(nouveauScore);
            contact.setLeadStage(leadStagePour(nouveauScore));
            contactRepository.save(contact);
        }
        if (!inactifs.isEmpty()) {
            log.info("Décroissance d'engagement appliquée à {} contact(s) inactif(s)", inactifs.size());
        }
    }

    private void appliquerDelta(Contact contact, double delta) {
        double courant = contact.getScoreEngagement() != null ? contact.getScoreEngagement() : SCORE_MIN;
        double nouveauScore = Math.max(SCORE_MIN, Math.min(SCORE_MAX, courant + delta));
        contact.setScoreEngagement(nouveauScore);
        contact.setDerniereActiviteEngagement(LocalDateTime.now());
        contact.setLeadStage(leadStagePour(nouveauScore));
        contactRepository.save(contact);
    }

    private RoleleadStage leadStagePour(double score) {
        if (score > 70) return RoleleadStage.High_Intent;
        if (score > 40) return RoleleadStage.Engaged;
        return RoleleadStage.New;
    }

    private LocalDateTime plusRecent(LocalDateTime a, LocalDateTime b) {
        if (a == null) return b;
        if (b == null) return a;
        return a.isAfter(b) ? a : b;
    }
}
