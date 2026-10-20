package com.mailinbox.crm_service.service;

import com.mailinbox.crm_service.entity.Activite;
import com.mailinbox.crm_service.entity.Client;
import com.mailinbox.crm_service.entity.Contact;
import com.mailinbox.crm_service.entity.Deal;
import com.mailinbox.crm_service.enums.TypeActivite;
import com.mailinbox.crm_service.exception.NotFoundException;
import com.mailinbox.crm_service.repository.ActiviteRepository;
import com.mailinbox.crm_service.repository.ContactRepository;
import com.mailinbox.crm_service.repository.DealRepository;
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
class ActiviteServiceTest {

    @Mock ActiviteRepository activiteRepository;
    @Mock ContactRepository contactRepository;
    @Mock DealRepository dealRepository;

    @InjectMocks ActiviteService activiteService;

    private static final CurrentPrincipal STAFF = CurrentPrincipal.staff(null);

    private CurrentPrincipal clientPrincipal(Long id) {
        Client client = new Client();
        client.setId(id);
        return CurrentPrincipal.client(client);
    }

    @Test
    void creer_client_avecContactDunAutreTenant_leveNotFoundException() {
        CurrentPrincipal principal = clientPrincipal(1L);

        Contact contact = new Contact();
        contact.setId(5L);
        contact.setClientId(2L); // autre tenant

        Activite activite = new Activite();
        activite.setType(TypeActivite.TACHE);
        activite.setTitre("Relance");

        when(contactRepository.findById(5L)).thenReturn(Optional.of(contact));

        assertThatThrownBy(() -> activiteService.creer(activite, 5L, null, principal))
                .isInstanceOf(NotFoundException.class);

        verify(activiteRepository, never()).save(any());
    }

    @Test
    void creer_client_setClientId() {
        CurrentPrincipal principal = clientPrincipal(1L);

        Activite activite = new Activite();
        activite.setType(TypeActivite.TACHE);
        activite.setTitre("Relance");

        when(activiteRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Activite result = activiteService.creer(activite, null, null, principal);

        assertThat(result.getClientId()).isEqualTo(1L);
    }

    @Test
    void creerEvenementSysteme_heriteClientIdDuContact() {
        Contact contact = new Contact();
        contact.setId(3L);
        contact.setClientId(9L);

        when(contactRepository.findById(3L)).thenReturn(Optional.of(contact));
        when(activiteRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Activite result = activiteService.creerEvenementSysteme("Contact créé", 3L, null);

        assertThat(result.getClientId()).isEqualTo(9L);
        assertThat(result.getType()).isEqualTo(TypeActivite.SYSTEME);
    }

    @Test
    void changerStatut_client_autreTenant_leveNotFoundException() {
        Activite activite = new Activite();
        activite.setId(7L);
        activite.setClientId(1L);

        when(activiteRepository.findById(7L)).thenReturn(Optional.of(activite));

        assertThatThrownBy(() ->
                activiteService.changerStatut(7L, com.mailinbox.crm_service.enums.StatutActivite.TERMINEE, clientPrincipal(2L)))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void getByDeal_verifieAppartenanceDuDeal() {
        Deal deal = new Deal();
        deal.setId(4L);
        deal.setClientId(1L);

        when(dealRepository.findById(4L)).thenReturn(Optional.of(deal));
        when(activiteRepository.findByDealIdOrderByDateCreationDesc(4L)).thenReturn(java.util.List.of());

        activiteService.getByDeal(4L, clientPrincipal(1L));

        verify(activiteRepository).findByDealIdOrderByDateCreationDesc(4L);
    }

    @Test
    void getByDeal_client_autreTenant_leveNotFoundException() {
        Deal deal = new Deal();
        deal.setId(4L);
        deal.setClientId(1L);

        when(dealRepository.findById(4L)).thenReturn(Optional.of(deal));

        assertThatThrownBy(() -> activiteService.getByDeal(4L, clientPrincipal(2L)))
                .isInstanceOf(NotFoundException.class);
    }
}
