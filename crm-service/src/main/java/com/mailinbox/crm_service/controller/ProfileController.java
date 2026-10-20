package com.mailinbox.crm_service.controller;

import com.mailinbox.crm_service.dto.ClientResponseDTO;
import com.mailinbox.crm_service.dto.PhotoUpdateRequest;
import com.mailinbox.crm_service.dto.UserResponseDTO;
import com.mailinbox.crm_service.security.CurrentPrincipal;
import com.mailinbox.crm_service.security.CurrentUserService;
import com.mailinbox.crm_service.service.ClientService;
import com.mailinbox.crm_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;
    private final ClientService clientService;
    private final CurrentUserService currentUserService;

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal Jwt jwt) {
        CurrentPrincipal principal = currentUserService.resolve(jwt);
        if (principal.isStaff()) {
            return ResponseEntity.ok(UserResponseDTO.from(principal.staffUser()));
        }
        return ResponseEntity.ok(ClientResponseDTO.from(principal.client()));
    }

    @PutMapping("/me/photo")
    public ResponseEntity<?> updateMyPhoto(@AuthenticationPrincipal Jwt jwt,
                                            @RequestBody PhotoUpdateRequest request) {
        CurrentPrincipal principal = currentUserService.resolve(jwt);
        if (principal.isStaff()) {
            return ResponseEntity.ok(UserResponseDTO.from(
                    userService.updatePhoto(principal.staffUser().getId(), request.photoUrl())));
        }
        return ResponseEntity.ok(ClientResponseDTO.from(
                clientService.updatePhoto(principal.client().getId(), request.photoUrl())));
    }
}
