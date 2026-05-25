package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.dto.ChangePasswordDTO;
import com.oncoassist.oncoassist.model.dto.MedecinAvecStatsDTO;
import com.oncoassist.oncoassist.model.dto.MedecinProfilDTO;
import com.oncoassist.oncoassist.model.dto.MedecinResponseDTO;
import com.oncoassist.oncoassist.model.entity.Medecin;
import com.oncoassist.oncoassist.service.MedecinService;
import lombok.RequiredArgsConstructor;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/medecins")
@RequiredArgsConstructor
public class MedecinController {

    private final MedecinService medecinService;

    // ── Créer ─────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<Medecin> creer(
            @RequestBody Medecin medecin,
            @RequestParam UUID specialiteId) {
        return ResponseEntity.ok(
                medecinService.creer(medecin, specialiteId)
        );
    }

    // ── Liste tous les médecins ───────────────────
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SECRETAIRE', 'MEDECIN')")
    public ResponseEntity<List<Medecin>> findAll() {
        return ResponseEntity.ok(medecinService.findAll());
    }

    // ── Liste avec statut (pour le frontend) ──────
    @GetMapping("/avec-statut")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SECRETAIRE', 'MEDECIN')")
    public ResponseEntity<List<MedecinResponseDTO>> findAllAvecStatut() {
        return ResponseEntity.ok(medecinService.findAllMedecins());
    }

    @GetMapping("/{id}/planning")
    @PreAuthorize("hasAnyAuthority('SECRETAIRE', 'ADMIN', 'MEDECIN')")
    public ResponseEntity<List<Map<String, Object>>> getPlanning(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "0") int semaine) {
        return ResponseEntity.ok(
                medecinService.getPlanning(id, semaine)
        );
    }

    // ── Un médecin par ID ─────────────────────────
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SECRETAIRE', 'MEDECIN')")
    public ResponseEntity<MedecinResponseDTO> findById(
            @PathVariable UUID id) {
        return ResponseEntity.ok(
                medecinService.findByIdDTO(id)
        );
    }

    // ── Par spécialité ────────────────────────────
    @GetMapping("/specialite/{specialiteId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SECRETAIRE', 'MEDECIN')")
    public ResponseEntity<List<Medecin>> findBySpecialite(
            @PathVariable UUID specialiteId) {
        return ResponseEntity.ok(
                medecinService.findBySpecialite(specialiteId)
        );
    }

    // ── Modifier (admin) ──────────────────────────
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<Medecin> modifier(
            @PathVariable UUID id,
            @RequestPart("data") Medecin medecin,
            @RequestPart(value = "specialiteId", required = false)
            String specialiteId,
            @RequestPart(value = "photo", required = false)
            MultipartFile photo) throws IOException {

        UUID specId = specialiteId != null
                ? UUID.fromString(specialiteId) : null;
        return ResponseEntity.ok(
                medecinService.modifier(id, medecin, specId, photo)
        );
    }

    // ── Supprimer ─────────────────────────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<Void> supprimer(@PathVariable UUID id) {
        medecinService.supprimer(id);
        return ResponseEntity.noContent().build();
    }

    // ── Médecin modifie son propre profil ─────────
    @PutMapping(value = "/profil/{id}", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyAuthority('MEDECIN')")
    public ResponseEntity<Medecin> modifierProfil(
            @PathVariable UUID id,
            @RequestPart("data") MedecinProfilDTO data,
            @RequestPart(value = "photo", required = false)
            MultipartFile photo) throws IOException {
        return ResponseEntity.ok(
                medecinService.modifierProfil(id, data, photo)
        );
    }

    // ── Médecin change son mot de passe ───────────
    @PutMapping("/profil/{id}/change-password")
    @PreAuthorize("hasAnyAuthority('MEDECIN')")
    public ResponseEntity<Void> changerMotDePasse(
            @PathVariable UUID id,
            @RequestBody ChangePasswordDTO dto) {
        medecinService.changerMotDePasse(id, dto);
        return ResponseEntity.ok().build();
    }

    // ── Liste pour la secrétaire ──────────────────
    @GetMapping("/secretaire/liste")
    @PreAuthorize("hasAnyAuthority('SECRETAIRE', 'ADMIN')")
    public ResponseEntity<List<MedecinResponseDTO>> getListePourSecretaire() {
        return ResponseEntity.ok(
                medecinService.findAllMedecins()
        );
    }

    // ── Médecins de mon service (secrétaire) ──────
    @GetMapping("/ma-specialite")
    @PreAuthorize("hasAnyAuthority('SECRETAIRE', 'ADMIN')")
    public ResponseEntity<List<MedecinAvecStatsDTO>> getMedecinsDeMonService(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                medecinService.findBySpecialiteDeSecretaireAvecStats(userDetails.getUsername())
        );
    }
}