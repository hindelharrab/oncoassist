package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.dto.mammographie.MammographieRequestDTO;
import com.oncoassist.oncoassist.model.dto.mammographie.MammographieResponseDTO;
import com.oncoassist.oncoassist.service.MammographieService;
import org.springframework.http.ResponseEntity;
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

    @PostMapping("/dossier/{dossierId}/analyze")
    public ResponseEntity<MammographieResponseDTO> analyze(
            @PathVariable UUID dossierId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("medecinId") UUID medecinId) {  // ← AJOUT

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            MammographieResponseDTO result = mammographieService
                    .analyzeAndSave(dossierId, file, medecinId);  // ← MODIFIÉ
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/dossier/{dossierId}")
    public ResponseEntity<List<MammographieResponseDTO>> getByDossier(@PathVariable UUID dossierId) {
        return ResponseEntity.ok(mammographieService.getByDossier(dossierId));
    }
}