package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.dto.mammographie.MammographieRequestDTO;
import com.oncoassist.oncoassist.model.dto.mammographie.MammographieResponseDTO;
import com.oncoassist.oncoassist.service.MammographieService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/mammographie")
public class MammographieController {

    private final MammographieService mammographieService;

    public MammographieController(MammographieService mammographieService) {
        this.mammographieService = mammographieService;
    }

    @PostMapping("/dossier/{patientId}/analyze")
    public ResponseEntity<MammographieResponseDTO> analyze(
            @PathVariable UUID patientId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("medecinId") UUID medecinId) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            MammographieResponseDTO result = mammographieService
                    .analyzeAndSave(patientId, file, medecinId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/dossier/{patientId}")
    @PreAuthorize("hasAnyAuthority('MEDECIN', 'SECRETAIRE', 'ADMIN', 'PATIENT')")
    public ResponseEntity<List<MammographieResponseDTO>> getByDossier(
            @PathVariable UUID patientId) {
        return ResponseEntity.ok(
                mammographieService.getByPatient(patientId)
        );
    }
}