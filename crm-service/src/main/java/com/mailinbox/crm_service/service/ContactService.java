package com.mailinbox.crm_service.service;

import com.mailinbox.crm_service.entity.Client;
import com.mailinbox.crm_service.entity.Contact;
import com.mailinbox.crm_service.enums.RoleleadStage;
import com.mailinbox.crm_service.enums.RoleSource;
import com.mailinbox.crm_service.enums.RoleStatut;
import com.mailinbox.crm_service.exception.NotFoundException;
import com.mailinbox.crm_service.exception.ValidationException;
import com.mailinbox.crm_service.repository.ContactRepository;
import com.mailinbox.crm_service.security.CurrentPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contactRepository;
    private final ActiviteService   activiteService;
    private final EngagementScoringService engagementScoringService;
    private final ClientService clientService;
    private final EntrepriseService entrepriseService;

    @Transactional(readOnly = true)
    public Page<Contact> getAllContacts(Pageable pageable, CurrentPrincipal principal) {
        if (principal.isClient()) {
            return contactRepository.findAllActiveByClientId(principal.client().getId(), pageable);
        }
        // Staff : isolation complète, ne voit que ses propres contacts internes
        // (créés avec clientId=null), jamais les données commerciales des tenants.
        return contactRepository.findAllActiveInternal(pageable);
    }

    @Transactional(readOnly = true)
    public Contact getContactById(Long id, CurrentPrincipal principal) {
        Contact contact = fetchOrThrow(id);
        assertVisible(contact, principal);
        return contact;
    }

    private Contact fetchOrThrow(Long id) {
        return contactRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Contact non trouvé : " + id));
    }

    // 404 générique (pas 403) pour ne pas révéler l'existence d'une ressource chez un autre tenant
    private void assertVisible(Contact contact, CurrentPrincipal principal) {
        if (principal.isClient()
                && (contact.getClientId() == null || !contact.getClientId().equals(principal.client().getId()))) {
            throw new NotFoundException("Contact non trouvé : " + contact.getId());
        }
    }

    @Transactional
    public Contact createContact(Contact contact, CurrentPrincipal principal) {
        boolean emailExists = principal.isClient()
                ? contactRepository.existsByEmailActiveForClient(contact.getEmail(), principal.client().getId())
                : contactRepository.existsByEmailActiveGlobal(contact.getEmail());
        if (emailExists) {
            throw new ValidationException("Cet email est déjà utilisé : " + contact.getEmail());
        }

        if (principal.isClient()) {
            clientService.verifierLimiteContacts(principal.client());
            contact.setClientId(principal.client().getId());
            if (contact.getEntreprise() != null && contact.getEntreprise().getId() != null) {
                entrepriseService.assertVisible(
                        entrepriseService.fetchOrThrow(contact.getEntreprise().getId()), principal);
            }
        }

        contact.setDeleted(false);
        Contact saved;
        try {
            saved = contactRepository.save(contact);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new ValidationException("Cet email est déjà utilisé : " + contact.getEmail());
        }

        if (principal.isClient()) {
            Client client = principal.client();
            client.setContactsUtilises(client.getContactsUtilises() + 1);
            clientService.save(client);
        }

        try {
            activiteService.creerEvenementSysteme(
                    "Contact créé : " + saved.getPrenom() + " " + saved.getNom(),
                    saved.getId(), null);
        } catch (Exception e) {
            log.warn("Activité non créée : {}", e.getMessage());
        }

        return saved;
    }

    @Transactional
    public Contact updateContact(Long id, Contact request, CurrentPrincipal principal) {
        Contact contact = fetchOrThrow(id);
        assertVisible(contact, principal);

        contact.setNom(request.getNom());
        contact.setPrenom(request.getPrenom());
        contact.setEmail(request.getEmail());
        contact.setTelephone(request.getTelephone());
        contact.setStatus(request.getStatus());
        contact.setSource(request.getSource());
        contact.setLeadStage(request.getLeadStage());

        Contact updated = contactRepository.save(contact);

        try {
            activiteService.creerEvenementSysteme(
                    "Contact mis à jour : " + updated.getPrenom() + " " + updated.getNom(),
                    updated.getId(), null);
        } catch (Exception e) {
            log.warn("Activité non créée : {}", e.getMessage());
        }

        return updated;
    }

    @Transactional
    public void deleteContact(Long id, CurrentPrincipal principal) {
        Contact contact = fetchOrThrow(id);
        assertVisible(contact, principal);
        contact.setDeleted(true);
        contact.setDeletedAt(LocalDateTime.now());
        contactRepository.save(contact);

        if (principal.isClient()) {
            Client client = principal.client();
            client.setContactsUtilises(Math.max(0, client.getContactsUtilises() - 1));
            clientService.save(client);
        }

        try {
            activiteService.creerEvenementSysteme(
                    "Contact supprimé : " + contact.getPrenom() + " " + contact.getNom(),
                    contact.getId(), null);
        } catch (Exception e) {
            log.warn("Activité non créée : {}", e.getMessage());
        }
    }

    @Transactional
    public Contact restoreContact(Long id, CurrentPrincipal principal) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Contact introuvable : " + id));
        assertVisible(contact, principal);
        contact.setDeleted(false);
        contact.setDeletedAt(null);
        Contact restored = contactRepository.save(contact);

        if (principal.isClient()) {
            Client client = principal.client();
            client.setContactsUtilises(client.getContactsUtilises() + 1);
            clientService.save(client);
        }

        return restored;
    }

    @Transactional
    public ImportResult importCSV(MultipartFile file, CurrentPrincipal principal) {
        if (principal.isClient()) {
            assertExportCsvAutorise(principal);
        }
        Long clientId = principal.isClient() ? principal.client().getId() : null;

        int successCount = 0;
        int errorCount   = 0;
        List<String> errors = new ArrayList<>();

        try {
            // Détecter le séparateur depuis la première ligne (virgule ou point-virgule)
            byte[] bytes = file.getBytes();
            String firstLine = new String(bytes, StandardCharsets.UTF_8)
                    .replace("﻿", "").split("[\r\n]+")[0];
            char delimiter = firstLine.contains(";") ? ';' : ',';

            try (BufferedReader reader = new BufferedReader(
                         new InputStreamReader(new java.io.ByteArrayInputStream(bytes), StandardCharsets.UTF_8));
                 CSVParser parser = CSVFormat.DEFAULT.builder()
                         .setDelimiter(delimiter)
                         .setIgnoreEmptyLines(true)
                         .setTrim(true)
                         .setHeader()
                         .setSkipHeaderRecord(true)
                         .build()
                         .parse(reader)) {

                // Normaliser les noms de colonnes (minuscules, sans BOM)
                java.util.Map<String, String> headerMap = new java.util.HashMap<>();
                parser.getHeaderMap().forEach((h, idx) ->
                    headerMap.put(h.toLowerCase().replace("﻿", "").trim(), h));

                String colEmail  = resolveHeader(headerMap, "email", "mail", "courriel", "e-mail");
                String colNom    = resolveHeader(headerMap, "nom", "name", "last_name", "lastname", "surname");
                String colPrenom = resolveHeader(headerMap, "prenom", "prénom", "firstname", "first_name", "given_name");
                String colTel    = resolveHeader(headerMap, "telephone", "téléphone", "tel", "phone", "mobile", "gsm");

                if (colEmail == null || colNom == null) {
                    throw new RuntimeException(
                        "Colonnes obligatoires introuvables. En-têtes détectés : " + headerMap.keySet());
                }

                for (CSVRecord record : parser) {
                    try {
                        String email = record.get(colEmail).trim();
                        String nom   = record.get(colNom).trim();

                        if (email.isEmpty() || nom.isEmpty()) {
                            errorCount++;
                            errors.add("Ligne " + record.getRecordNumber() + ": Email ou Nom manquant");
                            continue;
                        }

                        boolean emailExists = clientId != null
                                ? contactRepository.existsByEmailActiveForClient(email, clientId)
                                : contactRepository.existsByEmailActiveGlobal(email);
                        if (emailExists) {
                            errorCount++;
                            errors.add("Ligne " + record.getRecordNumber() + ": Email déjà existant - " + email);
                            continue;
                        }

                        if (clientId != null) {
                            clientService.verifierLimiteContacts(principal.client());
                        }

                        Contact contact = new Contact();
                        contact.setClientId(clientId);
                        contact.setEmail(email);
                        contact.setNom(nom);
                        contact.setPrenom(colPrenom != null ? record.get(colPrenom).trim() : "");
                        contact.setTelephone(colTel != null ? record.get(colTel).trim() : "");
                        contact.setStatus(RoleStatut.ABONNE);
                        contact.setSource(RoleSource.IMPORT);
                        contact.setLeadStage(RoleleadStage.New);
                        contact.setScoreEngagement(0.0);
                        contact.setDeleted(false);

                        Contact saved = contactRepository.save(contact);

                        try {
                            activiteService.creerEvenementSysteme(
                                    "Contact importé via CSV : " + saved.getPrenom() + " " + saved.getNom(),
                                    saved.getId(), null);
                        } catch (Exception e) {
                            log.warn("Activité CSV non créée : {}", e.getMessage());
                        }

                        successCount++;

                    } catch (Exception e) {
                        errorCount++;
                        errors.add("Ligne " + record.getRecordNumber() + ": " + e.getMessage());
                    }
                }
            }

        } catch (Exception e) {
            throw new RuntimeException("Erreur lecture CSV : " + e.getMessage(), e);
        }

        return new ImportResult(successCount, errorCount, errors);
    }

    private void assertExportCsvAutorise(CurrentPrincipal principal) {
        if (!principal.client().getPlanTier().isExportCSV()) {
            throw new ValidationException(
                    "L'import CSV n'est pas disponible dans le plan "
                            + principal.client().getPlanTier().getCode()
                            + " — Passez au plan supérieur");
        }
    }

    private String resolveHeader(java.util.Map<String, String> headerMap, String... candidates) {
        for (String key : candidates) {
            if (headerMap.containsKey(key)) return headerMap.get(key);
        }
        return null;
    }

    /**
     * Recalcule le score d'engagement d'un contact à partir de son historique de tracking
     * (aucun appel externe — calcul déterministe, voir EngagementScoringService).
     */
    @Transactional
    public Contact recalculerScoreEngagement(Long id, CurrentPrincipal principal) {
        assertVisible(fetchOrThrow(id), principal);
        return engagementScoringService.recalculerDepuisHistorique(id);
    }

    public static class ImportResult {
        private final int successCount;
        private final int errorCount;
        private final List<String> errors;

        public ImportResult(int successCount, int errorCount, List<String> errors) {
            this.successCount = successCount;
            this.errorCount   = errorCount;
            this.errors       = errors;
        }

        public int getSuccessCount()    { return successCount; }
        public int getErrorCount()      { return errorCount; }
        public List<String> getErrors() { return errors; }
    }
}