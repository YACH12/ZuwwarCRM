package com.mailinbox.crm_service.service;

import com.mailinbox.crm_service.entity.Client;
import com.mailinbox.crm_service.entity.PlanTier;
import com.mailinbox.crm_service.entity.Smtp;
import com.mailinbox.crm_service.exception.NotFoundException;
import com.mailinbox.crm_service.exception.ValidationException;
import com.mailinbox.crm_service.repository.SmtpRepository;
import com.mailinbox.crm_service.security.CurrentPrincipal;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SmtpServiceTest {

    @Mock SmtpRepository smtpRepository;
    @Mock EncryptionService encryptionService;

    @InjectMocks SmtpService smtpService;

    private static final CurrentPrincipal STAFF = CurrentPrincipal.staff(null);

    private CurrentPrincipal clientPrincipal(Long id, boolean smtpPersonnalise) {
        PlanTier plan = new PlanTier();
        plan.setSmtpPersonnalise(smtpPersonnalise);
        Client client = new Client();
        client.setId(id);
        client.setPlanTier(plan);
        return CurrentPrincipal.client(client);
    }

    @Test
    void getById_client_neVoitJamaisLeSmtpPlateforme() {
        Smtp plateforme = new Smtp();
        plateforme.setId(1L);
        plateforme.setClientId(null);

        when(smtpRepository.findById(1L)).thenReturn(Optional.of(plateforme));

        assertThatThrownBy(() -> smtpService.getSmtpById(1L, clientPrincipal(5L, true)))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void createSmtp_client_sansSmtpPersonnaliseDansLePlan_leveValidationException() {
        Smtp smtp = new Smtp();
        smtp.setPassword("secret");

        assertThatThrownBy(() -> smtpService.createSmtp(smtp, clientPrincipal(5L, false)))
                .isInstanceOf(ValidationException.class);

        verify(smtpRepository, never()).save(any());
    }

    @Test
    void createSmtp_client_avecSmtpPersonnalise_setClientId() {
        Smtp smtp = new Smtp();
        smtp.setPassword("secret");

        when(encryptionService.encrypt("secret")).thenReturn("encrypted");
        when(smtpRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Smtp result = smtpService.createSmtp(smtp, clientPrincipal(5L, true));

        assertThat(result.getClientId()).isEqualTo(5L);
    }

    @Test
    void activateSmtp_neDesactiveQueLesSmtpDuMemeTenant() {
        Smtp target = new Smtp();
        target.setId(2L);
        target.setClientId(5L);

        Smtp autreSmtpDuMemeTenant = new Smtp();
        autreSmtpDuMemeTenant.setId(3L);
        autreSmtpDuMemeTenant.setClientId(5L);
        autreSmtpDuMemeTenant.setActive(true);

        when(smtpRepository.findById(2L)).thenReturn(Optional.of(target));
        when(smtpRepository.findByClientId(5L)).thenReturn(List.of(autreSmtpDuMemeTenant));
        when(smtpRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        smtpService.activateSmtp(2L, clientPrincipal(5L, true));

        assertThat(autreSmtpDuMemeTenant.isActive()).isFalse();
        assertThat(target.isActive()).isTrue();
        verify(smtpRepository, never()).findByClientIdIsNull();
    }

    @Test
    void activateSmtp_staff_neDesactiveQueLesSmtpPlateforme() {
        Smtp target = new Smtp();
        target.setId(1L);
        target.setClientId(null);

        Smtp autrePlateforme = new Smtp();
        autrePlateforme.setId(4L);
        autrePlateforme.setClientId(null);
        autrePlateforme.setActive(true);

        when(smtpRepository.findById(1L)).thenReturn(Optional.of(target));
        when(smtpRepository.findByClientIdIsNull()).thenReturn(List.of(autrePlateforme));
        when(smtpRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        smtpService.activateSmtp(1L, STAFF);

        assertThat(autrePlateforme.isActive()).isFalse();
        verify(smtpRepository, never()).findByClientId(any(Long.class));
    }
}
