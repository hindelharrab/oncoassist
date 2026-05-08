package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.dto.consultation.*;
import com.oncoassist.oncoassist.service.ConsultationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;

    // ─────────────────────────────────────────────────────────
    // POST /api/consultations/dossier/{dossierId}
    // Créer une consultation complète (examen + antécédents)
    // Autorisé : MEDECIN
    // ─────────────────────────────────────────────────────────
    @PostMapping("/dossier/{dossierId}")
    @PreAuthorize("hasRole('MEDECIN')")
    public ResponseEntity<ConsultationResponseDTO> creerConsultation(
            @PathVariable UUID dossierId,
            @Valid @RequestBody ConsultationRequestDTO dto) {

        ConsultationResponseDTO response = consultationService.creerConsultation(dossierId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ─────────────────────────────────────────────────────────
    // GET /api/consultations/dossier/{dossierId}
    // Récupérer toutes les consultations d'un dossier
    // Autorisé : MEDECIN, ADMIN
    // ─────────────────────────────────────────────────────────
    @GetMapping("/dossier/{dossierId}")
    @PreAuthorize("hasAnyRole('MEDECIN', 'ADMIN')")
    public ResponseEntity<List<ConsultationResponseDTO>> getConsultations(
            @PathVariable UUID dossierId) {

        return ResponseEntity.ok(consultationService.getConsultationsByDossier(dossierId));
    }

    // ─────────────────────────────────────────────────────────
    // PUT /api/consultations/examen/{examenId}
    // Modifier un examen manuel
    // Autorisé : MEDECIN
    // ─────────────────────────────────────────────────────────
    @PutMapping("/examen/{examenId}")
    @PreAuthorize("hasRole('MEDECIN')")
    public ResponseEntity<ExamenManuelResponseDTO> modifierExamen(
            @PathVariable UUID examenId,
            @Valid @RequestBody ExamenManuelRequestDTO dto) {

        return ResponseEntity.ok(consultationService.modifierExamenManuel(examenId, dto));
    }

    // ─────────────────────────────────────────────────────────
    // DELETE /api/consultations/examen/{examenId}
    // Supprimer un examen manuel (les antécédents restent)
    // Autorisé : MEDECIN
    // ─────────────────────────────────────────────────────────
    @DeleteMapping("/examen/{examenId}")
    @PreAuthorize("hasRole('MEDECIN')")
    public ResponseEntity<Void> supprimerExamen(@PathVariable UUID examenId) {
        consultationService.supprimerExamenManuel(examenId);
        return ResponseEntity.noContent().build();
    }

    // ─────────────────────────────────────────────────────────
    // DELETE /api/consultations/antecedent-medical/{id}
    // Supprimer un antécédent médical
    // Autorisé : MEDECIN
    // ─────────────────────────────────────────────────────────
    @DeleteMapping("/antecedent-medical/{id}")
    @PreAuthorize("hasRole('MEDECIN')")
    public ResponseEntity<Void> supprimerAntecedentMedical(@PathVariable UUID id) {
        consultationService.supprimerAntecedentMedical(id);
        return ResponseEntity.noContent().build();
    }

    // ─────────────────────────────────────────────────────────
    // DELETE /api/consultations/antecedent-familial/{id}
    // Supprimer un antécédent familial
    // Autorisé : MEDECIN
    // ─────────────────────────────────────────────────────────
    @DeleteMapping("/antecedent-familial/{id}")
    @PreAuthorize("hasRole('MEDECIN')")
    public ResponseEntity<Void> supprimerAntecedentFamilial(@PathVariable UUID id) {
        consultationService.supprimerAntecedentFamilial(id);
        return ResponseEntity.noContent().build();
    }
}