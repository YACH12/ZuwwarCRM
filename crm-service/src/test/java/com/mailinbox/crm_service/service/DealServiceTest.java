package com.mailinbox.crm_service.service;

import com.mailinbox.crm_service.entity.Client;
import com.mailinbox.crm_service.entity.Contact;
import com.mailinbox.crm_service.entity.Deal;
import com.mailinbox.crm_service.enums.DealStage;
import com.mailinbox.crm_service.exception.NotFoundException;
import com.mailinbox.crm_service.repository.DealRepository;
import com.mailinbox.crm_service.security.CurrentPrincipal;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DealServiceTest {

    @Mock DealRepository dealRepository;
    @Mock ActiviteService activiteService;
    @Mock ContactService contactService;
    @Mock EntrepriseService entrepriseService;

    @InjectMocks DealService dealService;

    private static final CurrentPrincipal STAFF = CurrentPrincipal.staff(null);

    private CurrentPrincipal clientPrincipal(Long id) {
        Client client = new Client();
        client.setId(id);
        return CurrentPrincipal.client(client);
    }

    @Test
    void create_client_setClientId() {
        Deal deal = new Deal();
        deal.setTitre("Contrat X");
        deal.setMontant(new BigDecimal(1000));

        when(dealRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Deal result = dealService.create(deal, clientPrincipal(5L));

        assertThat(result.getClientId()).isEqualTo(5L);
    }

    @Test
    void create_client_avecContactDunAutreTenant_leveNotFoundException() {
        CurrentPrincipal principal = clientPrincipal(1L);

        Contact contactRef = new Contact();
        contactRef.setId(99L);

        Deal deal = new Deal();
        deal.setContact(contactRef);

        when(contactService.getContactById(99L, principal))
                .thenThrow(new NotFoundException("Contact non trouvé : 99"));

        assertThatThrownBy(() -> dealService.create(deal, principal))
                .isInstanceOf(NotFoundException.class);

        verify(dealRepository, never()).save(any());
    }

    @Test
    void getById_client_autreTenant_leveNotFoundException() {
        Deal deal = new Deal();
        deal.setId(1L);
        deal.setClientId(10L);

        when(dealRepository.findById(1L)).thenReturn(Optional.of(deal));

        assertThatThrownBy(() -> dealService.getById(1L, clientPrincipal(20L)))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void getAll_staff_utiliseFindAllGlobal() {
        when(dealRepository.findAll(any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(org.springframework.data.domain.Page.empty());

        dealService.getAll(org.springframework.data.domain.Pageable.unpaged(), STAFF);

        verify(dealRepository).findAll(any(org.springframework.data.domain.Pageable.class));
        verify(dealRepository, never()).findAllByClientId(any(), any());
    }

    @Test
    void getAll_client_utiliseFindAllByClientId() {
        when(dealRepository.findAllByClientId(eq(7L), any()))
                .thenReturn(org.springframework.data.domain.Page.empty());

        dealService.getAll(org.springframework.data.domain.Pageable.unpaged(), clientPrincipal(7L));

        verify(dealRepository).findAllByClientId(eq(7L), any());
    }

    @Test
    void changerStage_gagne_setDateCloture() {
        Deal deal = new Deal();
        deal.setId(1L);
        deal.setTitre("Deal A");

        when(dealRepository.findById(1L)).thenReturn(Optional.of(deal));
        when(dealRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Deal result = dealService.changerStage(1L, DealStage.GAGNE, STAFF);

        assertThat(result.getDateCloture()).isNotNull();
    }
}
