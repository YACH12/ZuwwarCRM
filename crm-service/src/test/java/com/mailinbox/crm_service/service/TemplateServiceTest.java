package com.mailinbox.crm_service.service;

import com.mailinbox.crm_service.entity.Client;
import com.mailinbox.crm_service.entity.Template;
import com.mailinbox.crm_service.exception.NotFoundException;
import com.mailinbox.crm_service.exception.ValidationException;
import com.mailinbox.crm_service.repository.TemplateRepository;
import com.mailinbox.crm_service.security.CurrentPrincipal;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TemplateServiceTest {

    @Mock TemplateRepository templateRepository;

    @InjectMocks TemplateService templateService;

    private CurrentPrincipal clientPrincipal(Long id) {
        Client client = new Client();
        client.setId(id);
        return CurrentPrincipal.client(client);
    }

    @Test
    void getById_client_voitLesTemplatesSysteme() {
        Template systeme = new Template();
        systeme.setId(1L);
        systeme.setClientId(null); // template système

        when(templateRepository.findById(1L)).thenReturn(Optional.of(systeme));

        Template result = templateService.getById(1L, clientPrincipal(5L));
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    void getById_client_autreTenant_leveNotFoundException() {
        Template template = new Template();
        template.setId(2L);
        template.setClientId(10L);

        when(templateRepository.findById(2L)).thenReturn(Optional.of(template));

        assertThatThrownBy(() -> templateService.getById(2L, clientPrincipal(20L)))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void update_client_templateSysteme_leveValidationException() {
        Template systeme = new Template();
        systeme.setId(3L);
        systeme.setClientId(null);

        when(templateRepository.findById(3L)).thenReturn(Optional.of(systeme));

        assertThatThrownBy(() -> templateService.update(3L, new Template(), clientPrincipal(5L)))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void update_client_sonPropreTemplate_reussit() {
        Template template = new Template();
        template.setId(4L);
        template.setClientId(5L);

        Template request = new Template();
        request.setNom("Nouveau nom");

        when(templateRepository.findById(4L)).thenReturn(Optional.of(template));
        when(templateRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Template result = templateService.update(4L, request, clientPrincipal(5L));
        assertThat(result.getNom()).isEqualTo("Nouveau nom");
    }

    @Test
    void create_client_setClientId() {
        Template template = new Template();
        when(templateRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Template result = templateService.create(template, clientPrincipal(5L));
        assertThat(result.getClientId()).isEqualTo(5L);
    }
}
