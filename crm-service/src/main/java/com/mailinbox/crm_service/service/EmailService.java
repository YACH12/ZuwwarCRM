package com.mailinbox.crm_service.service;

import com.mailinbox.crm_service.entity.Campaign;
import com.mailinbox.crm_service.entity.Contact;
import com.mailinbox.crm_service.entity.Smtp;
import com.mailinbox.crm_service.exception.NotFoundException;
import com.mailinbox.crm_service.repository.SmtpRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final SmtpRepository smtpRepository;
    private final SmtpService smtpService;

    @Value("${smtp.gmail.username:}")
    private String envUsername;

    @Value("${smtp.gmail.password:}")
    private String envPassword;

    // Résout le SMTP actif du tenant en priorité, sinon le SMTP plateforme (client_id NULL),
    // sinon le fallback ENV. Sans clientIdOrNull (null = staff/plateforme), va directement au SMTP plateforme.
    private Smtp getActiveSmtp(Long clientIdOrNull) {
        java.util.Optional<Smtp> tenantSmtp = clientIdOrNull != null
                ? smtpRepository.findByClientIdAndActiveTrue(clientIdOrNull)
                : java.util.Optional.empty();

        return tenantSmtp
                .or(() -> smtpRepository.findByClientIdIsNullAndActiveTrue())
                .map(smtp -> {
                    log.info("SMTP depuis DB — username: {}, password length: {}", smtp.getUsername(), smtp.getPassword() != null ? smtp.getPassword().trim().replace(" ", "").length() : 0);
                    return smtp;
                })
                .orElseGet(() -> {
                    if (!envUsername.isBlank() && !envPassword.isBlank()) {
                        log.info("SMTP depuis ENV — username: {}, password length: {}", envUsername, envPassword.trim().replace(" ", "").length());
                        Smtp fallback = new Smtp();
                        fallback.setHost("smtp.gmail.com");
                        fallback.setPort(587);
                        fallback.setUsername(envUsername.trim());
                        fallback.setPassword(envPassword.trim());
                        fallback.setActive(true);
                        return fallback;
                    }
                    throw new NotFoundException("Aucune config SMTP active trouvée");
                });
    }

    public void envoyerEmailSimple(String destinataire, String sujet, String htmlContent, Long clientIdOrNull) {
        Smtp smtp = getActiveSmtp(clientIdOrNull);
        JavaMailSenderImpl mailSender = smtpService.buildMailSender(smtp);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(destinataire);
            helper.setFrom(smtp.getUsername());
            helper.setSubject(sujet);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Email envoyé à : {}", destinataire);
        } catch (Exception e) {
            Throwable root = e.getCause() != null ? e.getCause() : e;
            log.error("Erreur envoi email à {} : {} — cause: {}", destinataire, e.getMessage(), root.getMessage());
            throw new RuntimeException("Erreur envoi email : " + e.getMessage());
        }
    }

    public void envoyerCampagne(Campaign campagne, List<Contact> contacts) {
        Smtp smtp = getActiveSmtp(campagne.getClientId());
        JavaMailSenderImpl mailSender = smtpService.buildMailSender(smtp);

        int totalEnvoye = 0;
        for (Contact contact : contacts) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setTo(contact.getEmail());
                helper.setFrom(smtp.getUsername());
                helper.setSubject(campagne.getSubject());
                String html = campagne.getHtmlContent()
                        .replace("{{prenom}}", contact.getPrenom() != null ? contact.getPrenom() : "")
                        .replace("{{nom}}", contact.getNom() != null ? contact.getNom() : "")
                        .replace("{{email}}", contact.getEmail() != null ? contact.getEmail() : "");
                helper.setText(html, true);
                mailSender.send(message);
                Thread.sleep(1000);
                totalEnvoye++;
            } catch (Exception e) {
                log.warn("Erreur envoi à {} : {}", contact.getEmail(), e.getMessage());
            }
        }

        campagne.setTotalSent(totalEnvoye);
        log.info("Campagne envoyée à {} contacts", totalEnvoye);
    }
}
