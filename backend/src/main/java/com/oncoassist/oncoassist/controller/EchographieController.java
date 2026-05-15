package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.dto.echographie.EchographieRequestDTO;
import com.oncoassist.oncoassist.model.dto.echographie.EchographieResponseDTO;
import com.oncoassist.oncoassist.service.EchographieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/echographies")
@RequiredArgsConstructor
public class EchographieController {

    private final EchographieService echographieService;

    // POST /api/echographies/dossier/{dossierId}
    @PostMapping("/dossier/{dossierId}")
    @PreAuthorize("hasAnyRole('MEDECIN', 'ADMIN')")
    public ResponseEntity<EchographieResponseDTO> creer(
            @PathVariable UUID dossierId,
            @Valid @RequestBody EchographieRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(echographieService.creer(dossierId, dto));
    }

    // GET /api/echographies/dossier/{dossierId}
    @GetMapping("/dossier/{dossierId}")
    @PreAuthorize("hasAnyRole('MEDECIN', 'ADMIN')")
    public ResponseEntity<List<EchographieResponseDTO>> getByDossier(
            @PathVariable UUID dossierId) {
        return ResponseEntity.ok(echographieService.getByDossier(dossierId));
    }

    // PUT /api/echographies/{id}
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MEDECIN', 'ADMIN')")
    public ResponseEntity<EchographieResponseDTO> modifier(
            @PathVariable UUID id,
            @Valid @RequestBody EchographieRequestDTO dto) {
        return ResponseEntity.ok(echographieService.modifier(id, dto));
    }

    // DELETE /api/echographies/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MEDECIN', 'ADMIN')")
    public ResponseEntity<Void> supprimer(@PathVariable UUID id) {
        echographieService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
    @PostMapping(value = "/{id}/image", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('MEDECIN', 'ADMIN')")
    public ResponseEntity<EchographieResponseDTO> uploadImage(
            @PathVariable UUID id,
            @RequestPart("image") MultipartFile image) throws IOException {
        return ResponseEntity.ok(echographieService.uploadImage(id, image));
    }
}