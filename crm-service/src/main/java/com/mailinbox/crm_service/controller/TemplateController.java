package com.mailinbox.crm_service.controller;
import com.mailinbox.crm_service.entity.Template;
import com.mailinbox.crm_service.security.CurrentUserService;
import com.mailinbox.crm_service.service.TemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/templates")
@RequiredArgsConstructor
public class TemplateController {
    private final TemplateService templateService;
    private final CurrentUserService currentUserService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<Page<Template>> getAll(Pageable pageable, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(templateService.getALLTemplates(pageable, currentUserService.resolve(jwt)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<Template> getByID(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(templateService.getById(id, currentUserService.resolve(jwt)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<Template> create(@RequestBody Template template, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(templateService.create(template, currentUserService.resolve(jwt)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INTEGRATEUR', 'CLIENT')")
    public ResponseEntity<Template> update(@PathVariable Long id, @RequestBody Template template, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(templateService.update(id, template, currentUserService.resolve(jwt)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        templateService.delete(id, currentUserService.resolve(jwt));
        return ResponseEntity.noContent().build();
    }
}
