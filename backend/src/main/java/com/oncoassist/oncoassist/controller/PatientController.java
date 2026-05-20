package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.dto.PatientDetailDTO;
import com.oncoassist.oncoassist.model.dto.PatientListItemDTO;
import com.oncoassist.oncoassist.model.dto.PatientRequestDTO;
import com.oncoassist.oncoassist.model.entity.Patient;
import com.oncoassist.oncoassist.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    // ── Créer ─────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasAnyAuthority('SECRETAIRE', 'ADMIN')")
    public ResponseEntity<PatientDetailDTO> creer(
            @RequestBody PatientRequestDTO dto) {
        Patient patient = patientService.creer(dto);
        // Retourner le DTO complet via findByIdDetail
        // pour avoir statut, medecinRef, age etc.
        return ResponseEntity.ok(
                patientService.findByIdDetail(patient.getId())
        );
    }

    // ── Lire tous ─────────────────────────────────
    @GetMapping
    @PreAuthorize("hasAnyAuthority('MEDECIN', 'SECRETAIRE', 'ADMIN')")
    public ResponseEntity<List<PatientDetailDTO>> findAll() {
        return ResponseEntity.ok(patientService.findAll());
    }

    // ── Lire un ───────────────────────────────────
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('MEDECIN', 'SECRETAIRE', 'ADMIN')")
    public ResponseEntity<PatientDetailDTO> findById(
            @PathVariable UUID id) {
        return ResponseEntity.ok(
                patientService.findByIdDetail(id)
        );
    }

    // ── Recherche ─────────────────────────────────
    @GetMapping("/search")
    @PreAuthorize("hasAnyAuthority('MEDECIN', 'SECRETAIRE', 'ADMIN')")
    public ResponseEntity<List<PatientDetailDTO>> rechercher(
            @RequestParam String nom) {
        return ResponseEntity.ok(
                patientService.rechercherDTO(nom)
        );
    }

    // ── Par médecin ───────────────────────────────
    @GetMapping("/medecin/{medecinId}")
    @PreAuthorize("hasAnyAuthority('MEDECIN', 'SECRETAIRE', 'ADMIN')")
    public ResponseEntity<List<Patient>> findByMedecin(
            @PathVariable UUID medecinId) {
        return ResponseEntity.ok(
                patientService.findByMedecin(medecinId)
        );
    }

    // ── Modifier ──────────────────────────────────
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SECRETAIRE')")
    public ResponseEntity<Patient> modifier(
            @PathVariable UUID id,
            @RequestPart("data") Patient patient,
            @RequestPart(value = "photo", required = false)
            MultipartFile photo) throws IOException {
        return ResponseEntity.ok(
                patientService.modifier(id, patient, photo)
        );
    }

    // ── Supprimer ─────────────────────────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<Void> supprimer(
            @PathVariable UUID id) {
        patientService.supprimer(id);
        return ResponseEntity.noContent().build();
    }

    // ── Liste avec statut (vue médecin) ───────────
    @GetMapping("/medecin/{medecinId}/avec-statut")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MEDECIN', 'SECRETAIRE')")
    public ResponseEntity<List<PatientListItemDTO>>
    findPatientsAvecStatut(@PathVariable UUID medecinId) {
        return ResponseEntity.ok(
                patientService.findByMedecinAvecStatut(medecinId)
        );
    }
}