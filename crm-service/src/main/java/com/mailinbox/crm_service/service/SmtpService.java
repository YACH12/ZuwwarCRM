package com.mailinbox.crm_service.service;

import com.mailinbox.crm_service.entity.Smtp;
import com.mailinbox.crm_service.exception.NotFoundException;
import com.mailinbox.crm_service.exception.ValidationException;
import com.mailinbox.crm_service.repository.SmtpRepository;
import com.mailinbox.crm_service.security.CurrentPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Properties;

@Service
@RequiredArgsConstructor
public class SmtpService {

    private final SmtpRepository smtpRepository;
    private final EncryptionService encryptionService;

    public Page<Smtp> getAllSmtps(Pageable pageable, CurrentPrincipal principal) {
        if (principal.isClient()) {
            return smtpRepository.findByClientId(principal.client().getId(), pageable);
        }
        return smtpRepository.findAll(pageable);
    }

    public Smtp getSmtpById(Long id, CurrentPrincipal principal) {
        Smtp smtp = fetchOrThrow(id);
        assertVisible(smtp, principal);
        return smtp;
    }

    private Smtp fetchOrThrow(Long id) {
        return smtpRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Smtp non trouvée : " + id));
    }

    // Un Client ne voit JAMAIS le SMTP plateforme (client_id NULL), même en lecture
    private void assertVisible(Smtp smtp, CurrentPrincipal principal) {
        if (principal.isClient()
                && (smtp.getClientId() == null || !smtp.getClientId().equals(principal.client().getId()))) {
            throw new NotFoundException("Smtp non trouvée : " + smtp.getId());
        }
    }

    public Smtp createSmtp(Smtp smtp, CurrentPrincipal principal) {
        if (principal.isClient()) {
            assertSmtpPersonnaliseAutorise(principal);
            smtp.setClientId(principal.client().getId());
        }
        smtp.setPassword(encryptionService.encrypt(smtp.getPassword()));
        return smtpRepository.save(smtp);
    }

    public Smtp updateSmtp(Long id, Smtp request, CurrentPrincipal principal) {
        Smtp smtp = fetchOrThrow(id);
        assertVisible(smtp, principal);
        smtp.setHost(request.getHost());
        smtp.setPort(request.getPort());
        smtp.setUsername(request.getUsername());
        smtp.setPassword(encryptionService.encrypt(request.getPassword()));
        smtp.setActive(request.isActive());
        return smtpRepository.save(smtp);
    }

    private void assertSmtpPersonnaliseAutorise(CurrentPrincipal principal) {
        if (!principal.client().getPlanTier().isSmtpPersonnalise()) {
            throw new ValidationException(
                    "Le SMTP personnalisé n'est pas disponible dans le plan "
                            + principal.client().getPlanTier().getCode()
                            + " — Passez au plan supérieur");
        }
    }

    // Désactive uniquement les autres SMTP du même périmètre (même tenant, ou plateforme) avant d'activer celui ciblé
    @Transactional
    public Smtp activateSmtp(Long id, CurrentPrincipal principal) {
        Smtp target = fetchOrThrow(id);
        assertVisible(target, principal);

        if (principal.isClient()) {
            assertSmtpPersonnaliseAutorise(principal);
        }

        Long scopeClientId = target.getClientId();
        var memeScope = scopeClientId == null
                ? smtpRepository.findByClientIdIsNull()
                : smtpRepository.findByClientId(scopeClientId);
        memeScope.forEach(s -> {
            s.setActive(false);
            smtpRepository.save(s);
        });

        target.setActive(true);
        return smtpRepository.save(target);
    }

    public boolean testSmtpConnection(Long id, CurrentPrincipal principal) {
        Smtp smtp = fetchOrThrow(id);
        assertVisible(smtp, principal);
        JavaMailSenderImpl mailSender = buildMailSender(smtp);
        try {
            mailSender.testConnection();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public void deleteSmtp(Long id, CurrentPrincipal principal) {
        Smtp smtp = fetchOrThrow(id);
        assertVisible(smtp, principal);
        smtpRepository.delete(smtp);
    }

    public JavaMailSenderImpl buildMailSender(Smtp smtp) {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(smtp.getHost());
        mailSender.setPort(smtp.getPort());
        mailSender.setUsername(smtp.getUsername().trim());
        mailSender.setPassword(encryptionService.decrypt(smtp.getPassword()).trim().replace(" ", ""));
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.ssl.trust", smtp.getHost());
        props.put("mail.smtp.ssl.protocols", "TLSv1.2 TLSv1.3");
        props.put("mail.smtp.connectiontimeout", "10000");
        props.put("mail.smtp.timeout", "10000");
        props.put("mail.smtp.writetimeout", "10000");
        return mailSender;
    }
}
