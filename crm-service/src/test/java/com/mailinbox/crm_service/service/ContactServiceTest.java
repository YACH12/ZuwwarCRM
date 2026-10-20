package com.mailinbox.crm_service.service;

import com.mailinbox.crm_service.entity.Client;
import com.mailinbox.crm_service.entity.Contact;
import com.mailinbox.crm_service.entity.PlanTier;
import com.mailinbox.crm_service.enums.RoleStatut;
import com.mailinbox.crm_service.exception.NotFoundException;
import com.mailinbox.crm_service.exception.ValidationException;
import com.mailinbox.crm_service.repository.ContactRepository;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

    @Mock ContactRepository contactRepository;
    @Mock ActiviteService activiteService;
    @Mock EngagementScoringService engagementScoringService;
    @Mock ClientService clientService;
    @Mock EntrepriseService entrepriseService;

    @InjectMocks ContactService contactService;

    private static final CurrentPrincipal STAFF = CurrentPrincipal.staff(null);

    private CurrentPrincipal clientPrincipal(Long clientId, int maxContacts, int contactsUtilises) {
        PlanTier plan = new PlanTier();
        plan.setMaxContacts(maxContacts);
        Client client = new Client();
        client.setId(clientId);
        client.setPlanTier(plan);
        client.setContactsUtilises(contactsUtilises);
        return CurrentPrincipal.client(client);
    }

    @Test
    void createContact_staff_happyPath() {
        Contact contact = new Contact();
        contact.setEmail("user@example.com");
        contact.setNom("Doe");
        contact.setPrenom("John");

        when(contactRepository.existsByEmailActiveGlobal("user@example.com")).thenReturn(false);
        when(contactRepository.save(any())).thenAnswer(inv -> {
            Contact c = inv.getArgument(0);
            c.setId(1L);
            return c;
        });

        Contact result = contactService.createContact(contact, STAFF);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.isDeleted()).isFalse();
        assertThat(result.getClientId()).isNull();
    }

    @Test
    void createContact_emailDejaUtilise_leveValidationException() {
        when(contactRepository.existsByEmailActiveGlobal("dup@example.com")).thenReturn(true);

        Contact contact = new Contact();
        contact.setEmail("dup@example.com");

        assertThatThrownBy(() -> contactService.createContact(contact, STAFF))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("déjà utilisé");
    }

    @Test
    void createContact_client_setsClientIdEtIncrementeCompteur() {
        CurrentPrincipal principal = clientPrincipal(42L, 100, 5);

        Contact contact = new Contact();
        contact.setEmail("tenant@example.com");

        when(contactRepository.existsByEmailActiveForClient("tenant@example.com", 42L)).thenReturn(false);
        when(contactRepository.save(any())).thenAnswer(inv -> {
            Contact c = inv.getArgument(0);
            c.setId(2L);
            return c;
        });

        Contact result = contactService.createContact(contact, principal);

        assertThat(result.getClientId()).isEqualTo(42L);
        assertThat(principal.client().getContactsUtilises()).isEqualTo(6);
        verify(clientService).save(principal.client());
    }

    @Test
    void createContact_client_limiteAtteinte_leveValidationException() {
        CurrentPrincipal principal = clientPrincipal(42L, 10, 10);

        Contact contact = new Contact();
        contact.setEmail("tenant@example.com");

        when(contactRepository.existsByEmailActiveForClient("tenant@example.com", 42L)).thenReturn(false);
        doThrow(new ValidationException("Limite de contacts atteinte (10) — Passez au plan supérieur"))
                .when(clientService).verifierLimiteContacts(principal.client());

        assertThatThrownBy(() -> contactService.createContact(contact, principal))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Limite de contacts atteinte");

        verify(contactRepository, never()).save(any());
    }

    @Test
    void createContact_client_avecEntrepriseDunAutreTenant_leveNotFoundException() {
        CurrentPrincipal principal = clientPrincipal(1L, 100, 0);

        com.mailinbox.crm_service.entity.Entreprise autreEntreprise = new com.mailinbox.crm_service.entity.Entreprise();
        autreEntreprise.setId(50L);
        autreEntreprise.setClientId(2L); // appartient à un autre tenant

        com.mailinbox.crm_service.entity.Entreprise entrepriseRef = new com.mailinbox.crm_service.entity.Entreprise();
        entrepriseRef.setId(50L);

        Contact contact = new Contact();
        contact.setEmail("x@example.com");
        contact.setEntreprise(entrepriseRef);

        when(contactRepository.existsByEmailActiveForClient("x@example.com", 1L)).thenReturn(false);
        when(entrepriseService.fetchOrThrow(50L)).thenReturn(autreEntreprise);
        doThrow(new NotFoundException("Entreprise introuvable : 50"))
                .when(entrepriseService).assertVisible(autreEntreprise, principal);

        assertThatThrownBy(() -> contactService.createContact(contact, principal))
                .isInstanceOf(NotFoundException.class);

        verify(contactRepository, never()).save(any());
    }

    @Test
    void getContactById_introuvable_leveNotFoundException() {
        when(contactRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> contactService.getContactById(99L, STAFF))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Contact non trouvé");
    }

    @Test
    void getContactById_client_accedeAuContactDUnAutreTenant_leveNotFoundException() {
        Contact contact = new Contact();
        contact.setId(5L);
        contact.setClientId(1L); // appartient au tenant 1

        when(contactRepository.findById(5L)).thenReturn(Optional.of(contact));

        CurrentPrincipal autreClient = clientPrincipal(2L, 100, 0); // tenant 2

        assertThatThrownBy(() -> contactService.getContactById(5L, autreClient))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void getContactById_client_accedeAUneDonneeInterne_leveNotFoundException() {
        Contact contact = new Contact();
        contact.setId(6L);
        contact.setClientId(null); // donnée interne/staff

        when(contactRepository.findById(6L)).thenReturn(Optional.of(contact));

        CurrentPrincipal client = clientPrincipal(1L, 100, 0);

        assertThatThrownBy(() -> contactService.getContactById(6L, client))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void getContactById_client_accedeASonPropreContact_reussit() {
        Contact contact = new Contact();
        contact.setId(7L);
        contact.setClientId(1L);

        when(contactRepository.findById(7L)).thenReturn(Optional.of(contact));

        CurrentPrincipal client = clientPrincipal(1L, 100, 0);

        Contact result = contactService.getContactById(7L, client);
        assertThat(result.getId()).isEqualTo(7L);
    }

    @Test
    void deleteContact_softDelete_staff() {
        Contact contact = new Contact();
        contact.setId(1L);
        contact.setEmail("del@example.com");
        contact.setNom("Del");
        contact.setPrenom("User");
        contact.setDeleted(false);

        when(contactRepository.findById(1L)).thenReturn(Optional.of(contact));
        when(contactRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        contactService.deleteContact(1L, STAFF);

        assertThat(contact.isDeleted()).isTrue();
        assertThat(contact.getDeletedAt()).isNotNull();
        verify(contactRepository).save(contact);
    }

    @Test
    void deleteContact_client_decrementeCompteur() {
        Contact contact = new Contact();
        contact.setId(8L);
        contact.setClientId(1L);
        contact.setDeleted(false);

        when(contactRepository.findById(8L)).thenReturn(Optional.of(contact));
        when(contactRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CurrentPrincipal principal = clientPrincipal(1L, 100, 5);

        contactService.deleteContact(8L, principal);

        assertThat(principal.client().getContactsUtilises()).isEqualTo(4);
        verify(clientService).save(principal.client());
    }

    @Test
    void deleteContact_client_autreTenant_leveNotFoundException() {
        Contact contact = new Contact();
        contact.setId(9L);
        contact.setClientId(1L);

        when(contactRepository.findById(9L)).thenReturn(Optional.of(contact));

        CurrentPrincipal autreClient = clientPrincipal(2L, 100, 0);

        assertThatThrownBy(() -> contactService.deleteContact(9L, autreClient))
                .isInstanceOf(NotFoundException.class);

        verify(contactRepository, never()).save(any());
    }

    @Test
    void updateContact_updatesFields() {
        Contact existing = new Contact();
        existing.setId(1L);
        existing.setEmail("old@example.com");
        existing.setNom("Old");
        existing.setPrenom("Name");
        existing.setStatus(RoleStatut.ABONNE);

        Contact request = new Contact();
        request.setNom("New");
        request.setPrenom("Name");
        request.setEmail("old@example.com");
        request.setStatus(RoleStatut.ABONNE);

        when(contactRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(contactRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Contact result = contactService.updateContact(1L, request, STAFF);

        assertThat(result.getNom()).isEqualTo("New");
    }

    @Test
    void restoreContact_clearsDeletedFlag() {
        Contact contact = new Contact();
        contact.setId(1L);
        contact.setDeleted(true);

        when(contactRepository.findById(1L)).thenReturn(Optional.of(contact));
        when(contactRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Contact result = contactService.restoreContact(1L, STAFF);

        assertThat(result.isDeleted()).isFalse();
        assertThat(result.getDeletedAt()).isNull();
    }
}
