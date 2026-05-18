package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.dto.RendezVousDTO;
import com.oncoassist.oncoassist.model.entity.RendezVous;
import com.oncoassist.oncoassist.service.RendezVousService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/rendez-vous")
@RequiredArgsConstructor
public class RendezVousController {

    private final RendezVousService rendezVousService;

    // ── Mutations (retournent RendezVous directement) ────────────────────
    @PostMapping("/demander")
    @PreAuthorize("hasAnyAuthority('MEDECIN')")
    public ResponseEntity<RendezVous> demander(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(rendezVousService.demander(
                UUID.fromString(body.get("medecinId")),
                UUID.fromString(body.get("patientId")),
                body.get("motif")
        ));
    }

    @PutMapping("/{id}/planifier")
    @PreAuthorize("hasAnyAuthority('SECRETAIRE')")
    public ResponseEntity<RendezVous> planifier(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(rendezVousService.planifier(
                id,
                LocalDateTime.parse(body.get("date")),
                body.get("lieu")
        ));
    }

    @PutMapping("/{id}/effectue")
    public ResponseEntity<RendezVous> marquerEffectue(@PathVariable UUID id) {
        return ResponseEntity.ok(rendezVousService.marquerEffectue(id));
    }

    @PutMapping("/{id}/annuler")
    public ResponseEntity<RendezVous> annuler(@PathVariable UUID id) {
        return ResponseEntity.ok(rendezVousService.annuler(id));
    }

    // ── Lectures (retournent RendezVousDTO) ──────────────────────────────
    @GetMapping
    public ResponseEntity<List<RendezVousDTO>> findAll() {
        return ResponseEntity.ok(rendezVousService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RendezVousDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(rendezVousService.toDTO(rendezVousService.findById(id)));
    }

    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<List<RendezVousDTO>> findByMedecin(@PathVariable UUID medecinId) {
        return ResponseEntity.ok(rendezVousService.findByMedecin(medecinId));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<RendezVousDTO>> findByPatient(@PathVariable UUID patientId) {
        return ResponseEntity.ok(rendezVousService.findByPatient(patientId));
    }

    @GetMapping("/en-attente")
    public ResponseEntity<List<RendezVousDTO>> findEnAttente() {
        return ResponseEntity.ok(rendezVousService.findEnAttente());
    }
}