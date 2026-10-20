package com.mailinbox.crm_service.controller;

import com.mailinbox.crm_service.dto.PhotoUpdateRequest;
import com.mailinbox.crm_service.dto.UserCreateRequest;
import com.mailinbox.crm_service.dto.UserResponseDTO;
import com.mailinbox.crm_service.entity.User;
import com.mailinbox.crm_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<Page<UserResponseDTO>> getAll(Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsers(pageable).map(UserResponseDTO::from));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(UserResponseDTO.from(userService.getUserById(id)));
    }

    @PostMapping
    public ResponseEntity<UserResponseDTO> create(@RequestBody UserCreateRequest request) {
        return ResponseEntity.ok(UserResponseDTO.from(userService.createUser(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> update(@PathVariable Long id,
                                                  @RequestBody User user) {
        return ResponseEntity.ok(UserResponseDTO.from(userService.updateUser(id, user)));
    }

    @PutMapping("/{id}/photo")
    public ResponseEntity<UserResponseDTO> updatePhoto(@PathVariable Long id,
                                                        @RequestBody PhotoUpdateRequest request) {
        return ResponseEntity.ok(UserResponseDTO.from(userService.updatePhoto(id, request.photoUrl())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

}