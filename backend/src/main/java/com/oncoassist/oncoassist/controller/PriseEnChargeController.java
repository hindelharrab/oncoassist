package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.entity.PriseEnCharge;
import com.oncoassist.oncoassist.service.PriseEnChargeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.oncoassist.oncoassist.model.dto.PriseEnChargeResponseDTO;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/prises-en-charge")
@RequiredArgsConstructor
public class PriseEnChargeController {

    private final PriseEnChargeService priseEnChargeService;

    // Secrétaire affecte un médecin à un patient
    @PostMapping("/affecter")
    @PreAuthorize("hasAnyAuthority('SECRETAIRE')")
    public ResponseEntity<PriseEnCharge> affecter(@RequestBody Map<String, String> body) {
        UUID patientId = UUID.fromString(body.get("patientId"));
        UUID medecinId = UUID.fromString(body.get("medecinId"));
        return ResponseEntity.ok(priseEnChargeService.affecter(patientId, medecinId));
    }

    // Clôturer une prise en charge
    @PutMapping("/{id}/cloturer")
    @PreAuthorize("hasAnyAuthority('SECRETAIRE', 'MEDECIN')")
    public ResponseEntity<PriseEnCharge> cloturer(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(priseEnChargeService.cloturer(id, body.get("motif")));
    }

    // Voir les prises en charge d'un patient
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('MEDECIN', 'SECRETAIRE', 'ADMIN')")
    public ResponseEntity<List<PriseEnChargeResponseDTO>> findByPatient(@PathVariable UUID patientId) {
        return ResponseEntity.ok(priseEnChargeService.findByPatientDTO(patientId));
    }

    // Voir les patients d'un médecin
    @GetMapping("/medecin/{medecinId}")
    @PreAuthorize("hasAnyAuthority('MEDECIN', 'ADMIN')")
    public ResponseEntity<List<PriseEnCharge>> findByMedecin(@PathVariable UUID medecinId) {
        return ResponseEntity.ok(priseEnChargeService.findByMedecin(medecinId));
    }
}