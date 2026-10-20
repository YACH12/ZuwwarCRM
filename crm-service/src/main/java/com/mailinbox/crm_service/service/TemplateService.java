package com.mailinbox.crm_service.service;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.mailinbox.crm_service.exception.NotFoundException;
import com.mailinbox.crm_service.exception.ValidationException;
import com.mailinbox.crm_service.repository.TemplateRepository;
import com.mailinbox.crm_service.entity.Template;
import com.mailinbox.crm_service.security.CurrentPrincipal;


import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class TemplateService {

    private final TemplateRepository templateRepository;

    public Page<Template> getALLTemplates(Pageable pageable, CurrentPrincipal principal){
       if (principal.isClient()) {
           return templateRepository.findAllVisiblesParClient(principal.client().getId(), pageable);
       }
       return templateRepository.findAll(pageable);
    }

    public Template getById(Long id, CurrentPrincipal principal){
        Template template = fetchOrThrow(id);
        assertVisible(template, principal);
        return template;
    }

    private Template fetchOrThrow(Long id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Template introuvable : " + id));
    }

    // Un Client voit les templates système (client_id NULL) + les siens
    private void assertVisible(Template template, CurrentPrincipal principal) {
        if (principal.isClient()
                && template.getClientId() != null
                && !template.getClientId().equals(principal.client().getId())) {
            throw new NotFoundException("Template introuvable : " + template.getId());
        }
    }

    // Seul le propriétaire (ou le staff) peut modifier/supprimer — jamais un template système
    private void assertModifiable(Template template, CurrentPrincipal principal) {
        assertVisible(template, principal);
        if (principal.isClient() && template.getClientId() == null) {
            throw new ValidationException("Les templates système ne peuvent pas être modifiés");
        }
    }

    public Template create(Template template, CurrentPrincipal principal){
        if (principal.isClient()) {
            template.setClientId(principal.client().getId());
        }
        return templateRepository.save(template);
    }

    public Template update(Long id, Template request, CurrentPrincipal principal){
       Template template = fetchOrThrow(id);
       assertModifiable(template, principal);
       template.setNom(request.getNom());
       template.setHtmlContent(request.getHtmlContent());
       template.setTextContent(request.getTextContent());
       template.setType(request.getType());

       return templateRepository.save(template);

    }

    public void delete(Long id, CurrentPrincipal principal){
       Template template = fetchOrThrow(id);
       assertModifiable(template, principal);
       templateRepository.delete(template);
    }



}
