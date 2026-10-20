package com.mailinbox.crm_service.service;

import com.mailinbox.crm_service.entity.Client;
import com.mailinbox.crm_service.entity.Entreprise;
import com.mailinbox.crm_service.exception.NotFoundException;
import com.mailinbox.crm_service.exception.ValidationException;
import com.mailinbox.crm_service.repository.EntrepriseRepository;
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
class EntrepriseServiceTest {

    @Mock EntrepriseRepository entrepriseRepository;

    @InjectMocks EntrepriseService entrepriseService;

    private static final CurrentPrincipal STAFF = CurrentPrincipal.staff(null);

    private CurrentPrincipal clientPrincipal(Long id) {
        Client client = new Client();
        client.setId(id);
        return CurrentPrincipal.client(client);
    }

    @Test
    void getById_client_autreTenant_leveNotFoundException() {
        Entreprise entreprise = new Entreprise();
        entreprise.setId(1L);
        entreprise.setClientId(10L);

        when(entrepriseRepository.findById(1L)).thenReturn(Optional.of(entreprise));

        assertThatThrownBy(() -> entrepriseService.getById(1L, clientPrincipal(20L)))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void getById_client_sonPropreTenant_reussit() {
        Entreprise entreprise = new Entreprise();
        entreprise.setId(2L);
        entreprise.setClientId(10L);

        when(entrepriseRepository.findById(2L)).thenReturn(Optional.of(entreprise));

        Entreprise result = entrepriseService.getById(2L, clientPrincipal(10L));
        assertThat(result.getId()).isEqualTo(2L);
    }

    @Test
    void create_client_setClientIdEtVerifieUniciteParTenant() {
        Entreprise entreprise = new Entreprise();
        entreprise.setEmail("acme@example.com");

        when(entrepriseRepository.existsByEmailAndClientId("acme@example.com", 10L)).thenReturn(false);
        when(entrepriseRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Entreprise result = entrepriseService.create(entreprise, clientPrincipal(10L));

        assertThat(result.getClientId()).isEqualTo(10L);
    }

    @Test
    void create_client_emailDejaUtiliseChezCeTenant_leveValidationException() {
        Entreprise entreprise = new Entreprise();
        entreprise.setEmail("dup@example.com");

        when(entrepriseRepository.existsByEmailAndClientId("dup@example.com", 10L)).thenReturn(true);

        assertThatThrownBy(() -> entrepriseService.create(entreprise, clientPrincipal(10L)))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void create_staff_utiliseUniciteGlobale() {
        Entreprise entreprise = new Entreprise();
        entreprise.setEmail("staff@example.com");

        when(entrepriseRepository.existsByEmailAndClientIdIsNull("staff@example.com")).thenReturn(false);
        when(entrepriseRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Entreprise result = entrepriseService.create(entreprise, STAFF);

        assertThat(result.getClientId()).isNull();
    }
}
