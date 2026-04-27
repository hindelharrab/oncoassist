package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.entity.Medecin;
import com.oncoassist.oncoassist.service.MedecinService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/medecins")
@RequiredArgsConstructor
public class MedecinController {

    private final MedecinService medecinService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Medecin> creer(
            @RequestBody Medecin medecin,
            @RequestParam UUID specialiteId) {
        return ResponseEntity.ok(medecinService.creer(medecin, specialiteId));
    }

    @GetMapping
    public ResponseEntity<List<Medecin>> findAll() {
        return ResponseEntity.ok(medecinService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medecin> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(medecinService.findById(id));
    }

    @GetMapping("/specialite/{specialiteId}")
    public ResponseEntity<List<Medecin>> findBySpecialite(@PathVariable UUID specialiteId) {
        return ResponseEntity.ok(medecinService.findBySpecialite(specialiteId));
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Medecin> modifier(
            @PathVariable UUID id,
            @RequestPart("data") Medecin medecin,
            @RequestPart(value = "specialiteId", required = false) String specialiteId,
            @RequestPart(value = "photo", required = false) MultipartFile photo) throws IOException {

        UUID specId = specialiteId != null ? UUID.fromString(specialiteId) : null;
        return ResponseEntity.ok(medecinService.modifier(id, medecin, specId, photo));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> supprimer(@PathVariable UUID id) {
        medecinService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}