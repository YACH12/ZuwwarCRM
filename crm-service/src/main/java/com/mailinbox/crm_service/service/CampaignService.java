package com.mailinbox.crm_service.service;

import com.mailinbox.crm_service.dto.CampaignDto;
import com.mailinbox.crm_service.entity.Campaign;
import com.mailinbox.crm_service.entity.Client;
import com.mailinbox.crm_service.entity.Contact;
import com.mailinbox.crm_service.entity.EmailTracking;
import com.mailinbox.crm_service.entity.Template;
import com.mailinbox.crm_service.enums.Statut;
import com.mailinbox.crm_service.exception.NotFoundException;
import com.mailinbox.crm_service.exception.ValidationException;
import com.mailinbox.crm_service.repository.CampaignContactRepository;
import com.mailinbox.crm_service.repository.CampaignRepository;
import com.mailinbox.crm_service.repository.ContactRepository;
import com.mailinbox.crm_service.repository.EmailTrackingRepository;
import com.mailinbox.crm_service.security.CurrentPrincipal;
import org.springframework.beans.factory.annotation.Value;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

// IMPORTANT : Utiliser le Transactional de Spring pour supporter readOnly = true
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class CampaignService {

    private final ContactRepository         contactRepository;
    private final CampaignRepository        campaignRepository;
    private final CampaignContactRepository campaignContactRepository;
    private final EmailTrackingRepository   emailTrackingRepository;
    private final EmailService              emailService;
    private final TemplateService           templateService;
    private final ClientService             clientService;

    @Value("${app.backend-url:http://localhost:8081}")
    private String backendUrl;

    // ADDED: @Transactional(readOnly = true) pour garder la session Hibernate ouverte durant le toDto
    @Transactional(readOnly = true)
    public Page<CampaignDto> getAll(Pageable pageable, CurrentPrincipal principal) {
        Page<Campaign> page = principal.isClient()
                ? campaignRepository.findAllByClientId(principal.client().getId(), pageable)
                : campaignRepository.findAll(pageable);
        page.forEach(this::enrichirStatsEngagement);
        return page.map(this::toDto);
    }

    // ADDED: @Transactional(readOnly = true)
    @Transactional(readOnly = true)
    public CampaignDto getById(Long id, CurrentPrincipal principal) {
        Campaign campaign = fetchOrThrow(id);
        assertVisible(campaign, principal);
        enrichirStatsEngagement(campaign);
        return toDto(campaign);
    }

    // ADDED: @Transactional
    @Transactional
    public CampaignDto create(Campaign campaign, CurrentPrincipal principal) {
        if (campaign.getTemplate() != null && campaign.getTemplate().getId() != null) {
            Template template = templateService.getById(campaign.getTemplate().getId(), principal);
            campaign.setTemplate(template);
            campaign.setHtmlContent(template.getHtmlContent());
            if (template.getSubject() != null) {
                campaign.setSubject(template.getSubject());
            }
        }
        if (principal.isClient()) {
            campaign.setClientId(principal.client().getId());
        }
        Campaign saved = campaignRepository.save(campaign);
        Campaign reloaded = campaignRepository.findById(saved.getId()).orElseThrow();
        enrichirStatsEngagement(reloaded);
        return toDto(reloaded);
    }

    // ADDED: @Transactional
    @Transactional
    public CampaignDto update(Long id, Campaign request, CurrentPrincipal principal) {
        Campaign campaign = fetchOrThrow(id);
        assertVisible(campaign, principal);
        campaign.setName(request.getName());
        campaign.setSubject(request.getSubject());
        campaign.setHtmlContent(request.getHtmlContent());
        campaign.setStatut(request.getStatut());
        campaign.setType(request.getType());
        campaign.setScheduledAt(request.getScheduledAt());
        Campaign saved = campaignRepository.save(campaign);
        enrichirStatsEngagement(saved);
        return toDto(saved);
    }

    @Transactional
    public void delete(Long id, CurrentPrincipal principal) {
        Campaign campaign = fetchOrThrow(id);
        assertVisible(campaign, principal);
        emailTrackingRepository.deleteAll(emailTrackingRepository.findByCampaignId(id));
        campaignContactRepository.deleteAll(campaignContactRepository.findByCampaignId(id));
        campaign.getContacts().clear();
        campaignRepository.save(campaign);
        campaignRepository.delete(campaign);
    }

    @Transactional
    public CampaignDto send(Long id, CurrentPrincipal principal) {
        Campaign campaign = fetchOrThrow(id);
        assertVisible(campaign, principal);

        Client client = principal.isClient() ? principal.client() : null;
        if (client != null) {
            clientService.verifierLimiteEmails(client);
        }

        campaign.setStatut(Statut.SENDING);
        campaignRepository.save(campaign);

        if (campaign.getContacts() == null || campaign.getContacts().isEmpty()) {
            log.warn("⚠️ Aucun contact associé à la campagne {}", id);
            campaign.setStatut(Statut.SENT);
            campaign.setSentAt(LocalDateTime.now());
            Campaign saved = campaignRepository.save(campaign);
            enrichirStatsEngagement(saved);
            return toDto(saved);
        }

        int success = 0;
        int errors  = 0;
        boolean quotaAtteint = false;

        for (Contact contact : campaign.getContacts()) {
            if (client != null) {
                try {
                    clientService.verifierLimiteEmails(client);
                } catch (ValidationException e) {
                    quotaAtteint = true;
                    log.warn("⚠️ Quota d'emails atteint pour le client {} après {} envoi(s) — "
                            + "campagne {} interrompue, {} contact(s) restant(s) non traité(s)",
                            client.getId(), success, id,
                            campaign.getContacts().size() - success - errors);
                    break;
                }
            }

            try {
                String token = UUID.randomUUID().toString();

                String html = campaign.getHtmlContent();
                html = html.replace("{{prenom}}",           contact.getPrenom()         != null ? contact.getPrenom()        : "");
                html = html.replace("{{nom}}",              contact.getNom()            != null ? contact.getNom()           : "");
                html = html.replace("{{email}}",            contact.getEmail()          != null ? contact.getEmail()         : "");
                html = html.replace("{{telephone}}",        contact.getTelephone()      != null ? contact.getTelephone()     : "");
                html = html.replace("{{scoreEngagement}}",  contact.getScoreEngagement() != null ? contact.getScoreEngagement().toString() : "0");
                html = html.replace("{{etape}}",            contact.getLeadStage()      != null ? contact.getLeadStage().toString() : "");
                html = html.replace("{{entreprise}}",       contact.getEntreprise()     != null ? contact.getEntreprise().getNom() : "");
                html = html.replace("{{dateAujourdhui}}",   java.time.LocalDate.now()
                        .format(java.time.format.DateTimeFormatter.ofPattern("dd MMMM yyyy",
                                java.util.Locale.FRENCH)));
                html = html.replace("{{nomCRM}}", "Zuwwar");

                java.util.Set<String> urlsAutorisees = new java.util.LinkedHashSet<>();
                html = reecrireLiensPourTracking(html, token, urlsAutorisees);

                EmailTracking tracking = new EmailTracking();
                tracking.setToken(token);
                tracking.setCampaign(campaign);
                tracking.setContact(contact);
                tracking.setAllowedUrls(String.join("|", urlsAutorisees));
                emailTrackingRepository.save(tracking);

                String pixelUrl = backendUrl + "/api/tracking/open/" + token;
                html += "<img src=\"" + pixelUrl + "\" width=\"1\" height=\"1\" style=\"display:none\" />";

                emailService.envoyerEmailSimple(
                    contact.getEmail(),
                    campaign.getSubject(),
                    html,
                    campaign.getClientId()
                );
                success++;
                if (client != null) {
                    client.setEmailsEnvoyes(client.getEmailsEnvoyes() + 1);
                }
                log.info("✅ Email envoyé à : {}", contact.getEmail());
            } catch (Exception e) {
                errors++;
                log.error("❌ Échec envoi à {} : {}", contact.getEmail(), e.getMessage());
            }
        }

        if (client != null) {
            clientService.save(client);
        }

        campaign.setStatut(Statut.SENT);
        campaign.setTotalSent(success);
        campaign.setTotalBounced(errors);
        campaign.setSentAt(LocalDateTime.now());

        if (quotaAtteint) {
            log.info("⚠️ Campagne {} terminée (quota atteint) — {} envoyés, {} erreurs, envoi interrompu",
                    id, success, errors);
        } else {
            log.info("✅ Campagne {} terminée — {} envoyés, {} erreurs", id, success, errors);
        }
        Campaign saved = campaignRepository.save(campaign);
        enrichirStatsEngagement(saved);
        return toDto(saved);
    }

    @Transactional
    public CampaignDto addContacts(Long campaignId, List<Long> contactIds, CurrentPrincipal principal) {
        Campaign campaign = fetchOrThrow(campaignId);
        assertVisible(campaign, principal);
        List<Contact> contacts = contactRepository.findAllById(contactIds);
        for (Contact contact : contacts) {
            assertContactVisible(contact, principal);
        }
        campaign.getContacts().addAll(contacts);
        Campaign saved = campaignRepository.save(campaign);
        enrichirStatsEngagement(saved);
        return toDto(saved);
    }

    // --- Méthodes utilitaires privées et mapping DTO ---

    public CampaignDto toDto(Campaign campaign) {
        if (campaign == null) {
            return null;
        }

        CampaignDto.TemplateSummaryDto templateDto = null;
        if (campaign.getTemplate() != null) {
            templateDto = CampaignDto.TemplateSummaryDto.builder()
                    .id(campaign.getTemplate().getId())
                    .nom(campaign.getTemplate().getNom())
                    .build();
        }

        return CampaignDto.builder()
                .id(campaign.getId())
                .clientId(campaign.getClientId())
                .name(campaign.getName())
                .subject(campaign.getSubject())
                .htmlContent(campaign.getHtmlContent())
                .template(templateDto)
                .statut(campaign.getStatut())
                .type(campaign.getType())
                .scheduledAt(campaign.getScheduledAt())
                .sentAt(campaign.getSentAt())
                .totalSent(campaign.getTotalSent())
                .totalBounced(campaign.getTotalBounced())
                .totalClicks(campaign.getTotalClicks())
                .totalOpened(campaign.getTotalOpened())
                .openRate(campaign.getOpenRate())
                .clickRate(campaign.getClickRate())
                .createdAt(campaign.getCreatedAt())
                .updatedAt(campaign.getUpdatedAt())
                .build();
    }

    private void enrichirStatsEngagement(Campaign campaign) {
        long ouverts = emailTrackingRepository.countByCampaignIdAndOuvertTrue(campaign.getId());
        long cliques  = emailTrackingRepository.countByCampaignIdAndCliqueTrue(campaign.getId());
        int envoyes  = campaign.getTotalSent() != null ? campaign.getTotalSent() : 0;

        campaign.setTotalOpened(Math.toIntExact(ouverts));
        campaign.setOpenRate(tauxPourcentage(ouverts, envoyes));
        campaign.setClickRate(tauxPourcentage(cliques, envoyes));
    }

    private double tauxPourcentage(long partie, int total) {
        if (total <= 0) return 0.0;
        return Math.round(partie * 1000.0 / total) / 10.0;
    }

    private static final Pattern PATTERN_HREF = Pattern.compile("href=([\"'])(https?://[^\"']+)([\"'])");

    private String reecrireLiensPourTracking(String html, String token, java.util.Set<String> urlsAutorisees) {
        Matcher matcher = PATTERN_HREF.matcher(html);
        StringBuilder resultat = new StringBuilder();
        while (matcher.find()) {
            String urlOriginale = matcher.group(2);
            urlsAutorisees.add(urlOriginale);
            String urlEncodee = URLEncoder.encode(urlOriginale, StandardCharsets.UTF_8);
            String urlTracking = backendUrl + "/api/tracking/click/" + token + "?url=" + urlEncodee;
            matcher.appendReplacement(resultat,
                    Matcher.quoteReplacement("href=" + matcher.group(1) + urlTracking + matcher.group(3)));
        }
        matcher.appendTail(resultat);
        return resultat.toString();
    }

    private Campaign fetchOrThrow(Long id) {
        return campaignRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Campagne introuvable : " + id));
    }

    private void assertVisible(Campaign campaign, CurrentPrincipal principal) {
        if (principal.isClient()
                && (campaign.getClientId() == null || !campaign.getClientId().equals(principal.client().getId()))) {
            throw new NotFoundException("Campagne introuvable : " + campaign.getId());
        }
    }

    private void assertContactVisible(Contact contact, CurrentPrincipal principal) {
        if (principal.isClient()
                && (contact.getClientId() == null || !contact.getClientId().equals(principal.client().getId()))) {
            throw new NotFoundException("Contact non trouvé : " + contact.getId());
        }
    }
}