package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.dto.admin.AdminSecretaireDTO;
import com.oncoassist.oncoassist.model.dto.admin.SecretaireCreationDTO;
import com.oncoassist.oncoassist.model.entity.Secretaire;
import com.oncoassist.oncoassist.model.entity.enums.RoleEnum;
import com.oncoassist.oncoassist.service.AdminSecretaireService;
import com.oncoassist.oncoassist.service.SecretaireService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/secretaires")
@RequiredArgsConstructor
public class SecretaireController {

    private final SecretaireService secretaireService;
    private final AdminSecretaireService adminSecretaireService; //  ajouté

    // ── Créer ─────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<AdminSecretaireDTO> creer(        //  retourne DTO
                                                            @RequestBody SecretaireCreationDTO dto,
                                                            @RequestParam(required = false) UUID specialiteId) {

        Secretaire secretaire = new Secretaire();
        secretaire.setNom(dto.getNom());
        secretaire.setPrenom(dto.getPrenom());
        secretaire.setEmail(dto.getEmail());
        secretaire.setMotDePasse(dto.getMotDePasse());
        secretaire.setTelephone(dto.getTelephone());
        secretaire.setRole(RoleEnum.SECRETAIRE);

        UUID finalSpecialiteId = specialiteId != null ? specialiteId : dto.getSpecialiteId();

        Secretaire saved = secretaireService.creer(secretaire, finalSpecialiteId);

        // ✅ recharge depuis la BDD avec la spécialité via le service admin
        return ResponseEntity.ok(adminSecretaireService.findById(saved.getId()));
    }

    // ── Liste tous ────────────────────────────────
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','SECRETAIRE')")
    public ResponseEntity<List<Secretaire>> findAll() {
        return ResponseEntity.ok(
                secretaireService.findAll()
        );
    }

    // ── Profil par ID ─────────────────────────────
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SECRETAIRE')")
    public ResponseEntity<Secretaire> findById(
            @PathVariable UUID id) {
        return ResponseEntity.ok(
                secretaireService.findById(id)
        );
    }

    // ── Par spécialité ────────────────────────────
    @GetMapping("/specialite/{specialiteId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MEDECIN')")
    public ResponseEntity<List<Secretaire>> findBySpecialite(
            @PathVariable UUID specialiteId) {
        return ResponseEntity.ok(
                secretaireService.findBySpecialite(specialiteId)
        );
    }

    // ── Modifier (admin) ──────────────────────────
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<Secretaire> modifier(
            @PathVariable UUID id,
            @RequestBody Secretaire secretaire,
            @RequestParam(required = false) UUID specialiteId) {
        return ResponseEntity.ok(
                secretaireService.modifier(
                        id, secretaire, specialiteId
                )
        );
    }

    // ── Modifier son propre profil ────────────────
    @PutMapping("/{id}/profil")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SECRETAIRE')")
    public ResponseEntity<Secretaire> modifierProfil(
            @PathVariable UUID id,
            @RequestBody Map<String, String> data) {
        return ResponseEntity.ok(
                secretaireService.modifierProfilMap(id, data)
        );
    }

    // ── Changer mot de passe ──────────────────────
    @PutMapping("/{id}/change-password")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SECRETAIRE')")
    public ResponseEntity<Void> changerMotDePasse(
            @PathVariable UUID id,
            @RequestBody Map<String, String> data) {
        secretaireService.changerMotDePasse(id, data);
        return ResponseEntity.ok().build();
    }
// ── Changer photo ─────────────────────────────
@PutMapping(value = "/{id}/photo",
        consumes = "multipart/form-data")
@PreAuthorize("hasAnyAuthority('ADMIN', 'SECRETAIRE')")
public ResponseEntity<Secretaire> changerPhoto(
        @PathVariable UUID id,
        @RequestParam("photo") MultipartFile photo)
        throws IOException {
    return ResponseEntity.ok(
            secretaireService.changerPhoto(id, photo)
    );
}

    // ── Upload photo (ancienne route) ─────────────
    @PostMapping("/{id}/photo")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SECRETAIRE')")
    public ResponseEntity<String> uploadPhoto(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file)
            throws IOException {
        return ResponseEntity.ok(
                secretaireService.uploadPhoto(id, file)
        );
    }

    // ── Supprimer ─────────────────────────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<Void> supprimer(
            @PathVariable UUID id) {
        secretaireService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}