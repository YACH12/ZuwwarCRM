package com.mailinbox.crm_service.service;

import com.mailinbox.crm_service.dto.CampaignDto;
import com.mailinbox.crm_service.entity.Campaign;
import com.mailinbox.crm_service.entity.Client;
import com.mailinbox.crm_service.entity.Contact;
import com.mailinbox.crm_service.entity.PlanTier;
import com.mailinbox.crm_service.exception.NotFoundException;
import com.mailinbox.crm_service.exception.ValidationException;
import com.mailinbox.crm_service.repository.CampaignContactRepository;
import com.mailinbox.crm_service.repository.CampaignRepository;
import com.mailinbox.crm_service.repository.ContactRepository;
import com.mailinbox.crm_service.repository.EmailTrackingRepository;
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
class CampaignServiceTest {

    @Mock ContactRepository contactRepository;
    @Mock CampaignRepository campaignRepository;
    @Mock CampaignContactRepository campaignContactRepository;
    @Mock EmailTrackingRepository emailTrackingRepository;
    @Mock EmailService emailService;
    @Mock TemplateService templateService;
    @Mock ClientService clientService;

    @InjectMocks CampaignService campaignService;

    private CurrentPrincipal clientPrincipal(Long id, int maxEmails, int emailsEnvoyes) {
        PlanTier plan = new PlanTier();
        plan.setMaxEmails(maxEmails);
        Client client = new Client();
        client.setId(id);
        client.setPlanTier(plan);
        client.setEmailsEnvoyes(emailsEnvoyes);
        return CurrentPrincipal.client(client);
    }

    @Test
    void create_client_setClientId() {
        Campaign campaign = new Campaign();
        when(campaignRepository.save(any())).thenAnswer(inv -> {
            Campaign c = inv.getArgument(0);
            c.setId(1L);
            return c;
        });
        when(campaignRepository.findById(1L)).thenAnswer(inv -> Optional.of(campaign));

        CampaignDto result = campaignService.create(campaign, clientPrincipal(5L, 100, 0));

        assertThat(result.getClientId()).isEqualTo(5L);
    }

    @Test
    void getById_client_autreTenant_leveNotFoundException() {
        Campaign campaign = new Campaign();
        campaign.setId(1L);
        campaign.setClientId(10L);

        when(campaignRepository.findById(1L)).thenReturn(Optional.of(campaign));

        assertThatThrownBy(() -> campaignService.getById(1L, clientPrincipal(20L, 100, 0)))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void send_client_limiteEmailsAtteinte_leveValidationException() {
        Campaign campaign = new Campaign();
        campaign.setId(1L);
        campaign.setClientId(5L);

        CurrentPrincipal principal = clientPrincipal(5L, 10, 10);

        when(campaignRepository.findById(1L)).thenReturn(Optional.of(campaign));
        doThrow(new ValidationException("Limite d'emails atteinte"))
                .when(clientService).verifierLimiteEmails(principal.client());

        assertThatThrownBy(() -> campaignService.send(1L, principal))
                .isInstanceOf(ValidationException.class);

        verify(emailService, never()).envoyerEmailSimple(any(), any(), any(), any());
    }

    @Test
    void send_client_incrementeEmailsEnvoyesParEnvoiReussi() {
        Campaign campaign = new Campaign();
        campaign.setId(1L);
        campaign.setClientId(5L);

        Contact c1 = new Contact();
        c1.setEmail("a@example.com");
        Contact c2 = new Contact();
        c2.setEmail("b@example.com");
        campaign.setContacts(List.of(c1, c2));
        campaign.setHtmlContent("Bonjour {{prenom}}");
        campaign.setSubject("Sujet");

        CurrentPrincipal principal = clientPrincipal(5L, 100, 0);

        when(campaignRepository.findById(1L)).thenReturn(Optional.of(campaign));
        when(campaignRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        campaignService.send(1L, principal);

        assertThat(principal.client().getEmailsEnvoyes()).isEqualTo(2);
        verify(clientService).save(principal.client());
    }

    @Test
    void addContacts_client_contactDunAutreTenant_leveNotFoundException() {
        Campaign campaign = new Campaign();
        campaign.setId(1L);
        campaign.setClientId(5L);
        campaign.setContacts(new java.util.ArrayList<>());

        Contact autreTenantContact = new Contact();
        autreTenantContact.setId(99L);
        autreTenantContact.setClientId(6L);

        when(campaignRepository.findById(1L)).thenReturn(Optional.of(campaign));
        when(contactRepository.findAllById(List.of(99L))).thenReturn(List.of(autreTenantContact));

        assertThatThrownBy(() -> campaignService.addContacts(1L, List.of(99L), clientPrincipal(5L, 100, 0)))
                .isInstanceOf(NotFoundException.class);

        verify(campaignRepository, never()).save(any());
    }
}