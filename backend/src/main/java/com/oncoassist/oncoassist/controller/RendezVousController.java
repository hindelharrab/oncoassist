package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.dto.RendezVousDTO;
import com.oncoassist.oncoassist.model.entity.RendezVous;
import com.oncoassist.oncoassist.service.RendezVousService;
import com.oncoassist.oncoassist.service.RendezVousPlanningService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/rendez-vous")
@RequiredArgsConstructor
public class RendezVousController {

    private final RendezVousService         rendezVousService;
    private final RendezVousPlanningService  planningService;

    // ── Planning semaine ──────────────────────────
    @GetMapping("/planning")
    @PreAuthorize("hasAnyAuthority('MEDECIN', 'SECRETAIRE', 'ADMIN')")
    public ResponseEntity<List<RendezVousDTO>> getPlanning(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate semaine,
            @RequestParam(required = false) UUID medecinId) {
        return ResponseEntity.ok(
                planningService.getRdvBySemaine(semaine, medecinId)
        );
    }

    // ── Créer RDV (secrétaire) ────────────────────
    @PostMapping
    @PreAuthorize("hasAnyAuthority('MEDECIN', 'SECRETAIRE', 'ADMIN')")
    public ResponseEntity<RendezVousDTO> creer(
            @RequestBody RendezVousDTO dto) {
        return ResponseEntity.ok(
                planningService.creer(dto)
        );
    }

    // ── Modifier RDV ──────────────────────────────
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('MEDECIN', 'SECRETAIRE', 'ADMIN')")
    public ResponseEntity<RendezVousDTO> modifier(
            @PathVariable UUID id,
            @RequestBody RendezVousDTO dto) {
        return ResponseEntity.ok(
                planningService.modifier(id, dto)
        );
    }

    // ── Demander RDV (médecin) ────────────────────
    @PostMapping("/demander")
    @PreAuthorize("hasAnyAuthority('MEDECIN')")
    public ResponseEntity<RendezVous> demander(
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                rendezVousService.demander(
                        UUID.fromString(body.get("medecinId")),
                        UUID.fromString(body.get("patientId")),
                        body.get("motif")
                ));
    }

    // ── Planifier RDV (secrétaire) ────────────────
    @PutMapping("/{id}/planifier")
    @PreAuthorize("hasAnyAuthority('SECRETAIRE')")
    public ResponseEntity<RendezVous> planifier(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                rendezVousService.planifier(
                        id,
                        LocalDateTime.parse(body.get("date")),
                        body.get("lieu")
                ));
    }

    // ── Marquer effectué ──────────────────────────
    @PutMapping("/{id}/effectue")
    @PreAuthorize("hasAnyAuthority('SECRETAIRE','MEDECIN','ADMIN')")
    public ResponseEntity<RendezVous> marquerEffectue(
            @PathVariable UUID id) {
        return ResponseEntity.ok(
                rendezVousService.marquerEffectue(id)
        );
    }

    // ── Annuler ───────────────────────────────────
    @PutMapping("/{id}/annuler")
    @PreAuthorize("hasAnyAuthority('SECRETAIRE','MEDECIN','ADMIN')")
    public ResponseEntity<RendezVous> annuler(
            @PathVariable UUID id) {
        return ResponseEntity.ok(
                rendezVousService.annuler(id)
        );
    }

    // ── Lectures ──────────────────────────────────
    @GetMapping
    @PreAuthorize("hasAnyAuthority('SECRETAIRE','MEDECIN','ADMIN')")
    public ResponseEntity<List<RendezVousDTO>> findAll() {
        return ResponseEntity.ok(rendezVousService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SECRETAIRE','MEDECIN','ADMIN')")
    public ResponseEntity<RendezVousDTO> findById(
            @PathVariable UUID id) {
        return ResponseEntity.ok(
                rendezVousService.toDTO(
                        rendezVousService.findById(id)
                ));
    }

    @GetMapping("/medecin/{medecinId}")
    @PreAuthorize("hasAnyAuthority('SECRETAIRE','MEDECIN','ADMIN')")
    public ResponseEntity<List<RendezVousDTO>> findByMedecin(
            @PathVariable UUID medecinId) {
        return ResponseEntity.ok(
                rendezVousService.findByMedecin(medecinId)
        );
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('SECRETAIRE','MEDECIN','ADMIN')")
    public ResponseEntity<List<RendezVousDTO>> findByPatient(
            @PathVariable UUID patientId) {
        return ResponseEntity.ok(
                rendezVousService.findByPatient(patientId)
        );
    }

    @GetMapping("/en-attente")
    @PreAuthorize("hasAnyAuthority('SECRETAIRE','MEDECIN','ADMIN')")
    public ResponseEntity<List<RendezVousDTO>> findEnAttente() {
        return ResponseEntity.ok(
                rendezVousService.findEnAttente()
        );
    }
}