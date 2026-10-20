package com.mailinbox.crm_service.service;

import com.mailinbox.crm_service.entity.Client;
import com.mailinbox.crm_service.entity.PlanTier;
import com.mailinbox.crm_service.enums.StatutClient;
import com.mailinbox.crm_service.exception.NotFoundException;
import com.mailinbox.crm_service.exception.ValidationException;
import com.mailinbox.crm_service.kafka.KafkaProducer;
import com.mailinbox.crm_service.repository.ClientRepository;
import com.mailinbox.crm_service.repository.PlanTierRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClientServiceTest {

    @Mock ClientRepository clientRepository;
    @Mock PlanTierRepository planTierRepository;
    @Mock EmailService emailService;
    @Mock KafkaProducer kafkaProducer;
    @Mock KeycloakAdminService keycloakAdminService;
    @Mock VisitorTrackingService visitorTrackingService;

    @InjectMocks ClientService clientService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(clientService, "frontendUrl", "http://localhost:4200");
    }

    @Test
    void inscrire_happyPath() {
        PlanTier plan = new PlanTier();
        plan.setCode("FREE");
        plan.setNom("Gratuit");
        plan.setActif(true);
        plan.setDureeEssaiJours(0);
        plan.setMaxContacts(100);
        plan.setMaxEmails(1000);

        Client client = new Client();
        client.setEmail("test@example.com");
        client.setNom("Test");
        client.setPrenom("User");

        when(clientRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(planTierRepository.findById("FREE")).thenReturn(Optional.of(plan));
        when(keycloakAdminService.creerUtilisateur(anyString(), anyString(), anyString(), anyString()))
                .thenReturn("keycloak-uuid-123");
        when(clientRepository.save(any())).thenAnswer(inv -> {
            Client c = inv.getArgument(0);
            c.setId(1L);
            return c;
        });

        Client result = clientService.inscrire(client, "FREE", "password123", null);

        assertThat(result.getStatut()).isEqualTo(StatutClient.ACTIF);
        assertThat(result.getKeycloakId()).isEqualTo("keycloak-uuid-123");
        verify(clientRepository).save(any());
    }

    @Test
    void inscrire_emailDejaUtilise_leveValidationException() {
        when(clientRepository.existsByEmail("existing@example.com")).thenReturn(true);

        Client client = new Client();
        client.setEmail("existing@example.com");

        assertThatThrownBy(() -> clientService.inscrire(client, "FREE", "password123", null))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Email déjà utilisé");
    }

    @Test
    void inscrire_planIntrouvable_leveNotFoundException() {
        when(clientRepository.existsByEmail(anyString())).thenReturn(false);
        when(planTierRepository.findById("INEXISTANT")).thenReturn(Optional.empty());

        Client client = new Client();
        client.setEmail("user@example.com");

        assertThatThrownBy(() -> clientService.inscrire(client, "INEXISTANT", "password123", null))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Plan introuvable");
    }

    @Test
    void getById_introuvable_leveNotFoundException() {
        when(clientRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> clientService.getById(99L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Client introuvable");
    }

    @Test
    void suspendre_changesStatut() {
        Client client = new Client();
        client.setId(1L);
        client.setStatut(StatutClient.ACTIF);

        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(clientRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Client result = clientService.suspendre(1L);

        assertThat(result.getStatut()).isEqualTo(StatutClient.SUSPENDU);
    }

    @Test
    void reactiver_changesStatut() {
        Client client = new Client();
        client.setId(1L);
        client.setStatut(StatutClient.SUSPENDU);

        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(clientRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Client result = clientService.reactiver(1L);

        assertThat(result.getStatut()).isEqualTo(StatutClient.ACTIF);
    }

    @Test
    void inscrire_avecEssai_setsDateExpiration() {
        PlanTier plan = new PlanTier();
        plan.setCode("DEMO");
        plan.setNom("Demo");
        plan.setActif(true);
        plan.setDureeEssaiJours(14);
        plan.setMaxContacts(500);
        plan.setMaxEmails(5000);

        Client client = new Client();
        client.setEmail("demo@example.com");
        client.setNom("Demo");
        client.setPrenom("User");

        when(clientRepository.existsByEmail(anyString())).thenReturn(false);
        when(planTierRepository.findById("DEMO")).thenReturn(Optional.of(plan));
        when(keycloakAdminService.creerUtilisateur(anyString(), anyString(), anyString(), anyString()))
                .thenReturn("kc-id");
        when(clientRepository.save(any())).thenAnswer(inv -> {
            Client c = inv.getArgument(0);
            c.setId(2L);
            return c;
        });

        Client result = clientService.inscrire(client, "DEMO", "password123", null);

        assertThat(result.getStatut()).isEqualTo(StatutClient.ESSAI);
        assertThat(result.getDateExpiration()).isNotNull();
    }
}
