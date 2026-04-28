package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.entity.Secretaire;
import com.oncoassist.oncoassist.service.SecretaireService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/secretaires")
@RequiredArgsConstructor
public class SecretaireController {

    private final SecretaireService secretaireService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Secretaire> creer(
            @RequestBody Secretaire secretaire,
            @RequestParam UUID specialiteId) {
        return ResponseEntity.ok(secretaireService.creer(secretaire, specialiteId));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Secretaire>> findAll() {
        return ResponseEntity.ok(secretaireService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDECIN')")
    public ResponseEntity<Secretaire> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(secretaireService.findById(id));
    }

    @GetMapping("/specialite/{specialiteId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDECIN')")
    public ResponseEntity<List<Secretaire>> findBySpecialite(@PathVariable UUID specialiteId) {
        return ResponseEntity.ok(secretaireService.findBySpecialite(specialiteId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Secretaire> modifier(
            @PathVariable UUID id,
            @RequestBody Secretaire secretaire,
            @RequestParam(required = false) UUID specialiteId) {
        return ResponseEntity.ok(secretaireService.modifier(id, secretaire, specialiteId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> supprimer(@PathVariable UUID id) {
        secretaireService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}