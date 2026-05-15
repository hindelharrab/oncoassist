package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.dto.VueEnsembleResponse;
import com.oncoassist.oncoassist.service.VueEnsembleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class VueEnsembleController {

    private final VueEnsembleService vueEnsembleService;

    /**
     * GET /api/patients/{patientId}/vue-ensemble
     *
     * Retourne toutes les données nécessaires pour la page VueEnsemble :
     *   - Résumé patient + équipe médicale
     *   - Antécédents médicaux & familiaux
     *   - Rendez-vous à venir
     *   - Examens (résumé grille)
     *   - Timeline dynamique (plans de traitement + examens)
     */
    @GetMapping("/{patientId}/vue-ensemble")
    @PreAuthorize("hasAnyRole('MEDECIN', 'SECRETAIRE', 'ADMIN')")
    public ResponseEntity<VueEnsembleResponse> getVueEnsemble(
            @PathVariable UUID patientId) {

        VueEnsembleResponse response = vueEnsembleService.buildVueEnsemble(patientId);
        return ResponseEntity.ok(response);
    }
}