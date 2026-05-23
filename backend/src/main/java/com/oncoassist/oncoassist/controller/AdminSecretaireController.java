package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.dto.admin.AdminSecretaireDTO;
import com.oncoassist.oncoassist.service.AdminSecretaireService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/secretaires")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminSecretaireController {

    private final AdminSecretaireService adminSecretaireService;

    // GET /api/admin/secretaires
    @GetMapping
    public ResponseEntity<List<AdminSecretaireDTO>> findAll() {
        return ResponseEntity.ok(adminSecretaireService.findAll());
    }

    // GET /api/admin/secretaires/{id}
    @GetMapping("/{id}")
    public ResponseEntity<AdminSecretaireDTO> findById(
            @PathVariable UUID id) {
        return ResponseEntity.ok(
                adminSecretaireService.findById(id));
    }
}