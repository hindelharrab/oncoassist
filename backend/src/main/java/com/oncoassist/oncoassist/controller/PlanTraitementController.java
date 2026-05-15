package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.dto.plantraitement.PlanTraitementRequestDTO;
import com.oncoassist.oncoassist.model.dto.plantraitement.PlanTraitementResponseDTO;
import com.oncoassist.oncoassist.service.PlanTraitementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/plans-traitement")
@RequiredArgsConstructor
public class PlanTraitementController {

    private final PlanTraitementService planTraitementService;

    @PostMapping("/dossier/{dossierId}")
    public ResponseEntity<PlanTraitementResponseDTO> creer(
            @PathVariable UUID dossierId,
            @Valid @RequestBody PlanTraitementRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(planTraitementService.creer(dossierId, dto));
    }

    @GetMapping("/dossier/{dossierId}")
    public ResponseEntity<List<PlanTraitementResponseDTO>> getByDossier(
            @PathVariable UUID dossierId) {
        return ResponseEntity.ok(planTraitementService.getByDossier(dossierId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlanTraitementResponseDTO> modifier(
            @PathVariable UUID id,
            @Valid @RequestBody PlanTraitementRequestDTO dto) {
        return ResponseEntity.ok(planTraitementService.modifier(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable UUID id) {
        planTraitementService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}