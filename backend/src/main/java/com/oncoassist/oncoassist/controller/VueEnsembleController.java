package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.dto.VueEnsembleDTO;
import com.oncoassist.oncoassist.service.VueEnsembleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/patients/{patientId}/vue-ensemble")
@RequiredArgsConstructor
public class VueEnsembleController {

    private final VueEnsembleService vueEnsembleService;

    /**
     * GET /api/patients/{patientId}/vue-ensemble
     * Retourne toutes les données nécessaires pour la page Vue Ensemble d'un patient.
     *
     * Accessible par : MEDECIN (référent ou collaborateur), SECRETAIRE, ADMIN
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('MEDECIN', 'SECRETAIRE', 'ADMIN')")
    public ResponseEntity<VueEnsembleDTO> getVueEnsemble(@PathVariable UUID patientId) {
        VueEnsembleDTO dto = vueEnsembleService.buildVueEnsemble(patientId);
        return ResponseEntity.ok(dto);
    }
}