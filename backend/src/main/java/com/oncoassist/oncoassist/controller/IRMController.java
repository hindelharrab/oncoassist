package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.dto.irm.IRMRequestDTO;
import com.oncoassist.oncoassist.model.dto.irm.IRMResponseDTO;
import com.oncoassist.oncoassist.service.IRMService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/irm")
@RequiredArgsConstructor
// ✅ Pas de @PreAuthorize — SecurityConfig protège tout avec .anyRequest().authenticated()
public class IRMController {

    private final IRMService irmService;

    // POST /api/irm/dossier/{dossierId}
    @PostMapping("/dossier/{dossierId}")
    public ResponseEntity<IRMResponseDTO> creer(
            @PathVariable UUID dossierId,
            @Valid @RequestBody IRMRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(irmService.creer(dossierId, dto));
    }

    // GET /api/irm/dossier/{dossierId}
    @GetMapping("/dossier/{dossierId}")
    public ResponseEntity<List<IRMResponseDTO>> getByDossier(
            @PathVariable UUID dossierId) {
        return ResponseEntity.ok(irmService.getByDossier(dossierId));
    }

    // PUT /api/irm/{id}
    @PutMapping("/{id}")
    public ResponseEntity<IRMResponseDTO> modifier(
            @PathVariable UUID id,
            @Valid @RequestBody IRMRequestDTO dto) {
        return ResponseEntity.ok(irmService.modifier(id, dto));
    }

    // DELETE /api/irm/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable UUID id) {
        irmService.supprimer(id);
        return ResponseEntity.noContent().build();
    }

    // POST /api/irm/{id}/image — upload image séparé
    @PostMapping(value = "/{id}/image", consumes = "multipart/form-data")
    public ResponseEntity<IRMResponseDTO> uploadImage(
            @PathVariable UUID id,
            @RequestPart("image") MultipartFile image) throws IOException {
        return ResponseEntity.ok(irmService.uploadImage(id, image));
    }
}