package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.dto.document.DocumentRequestDTO;
import com.oncoassist.oncoassist.model.dto.document.DocumentResponseDTO;
import com.oncoassist.oncoassist.service.DocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    // GET /api/documents/dossier/{dossierId}/ordonnances
    @GetMapping("/dossier/{dossierId}/ordonnances")
    @PreAuthorize("hasAnyAuthority('MEDECIN', 'SECRETAIRE', 'ADMIN', 'PATIENT')")
    public ResponseEntity<List<DocumentResponseDTO>> getOrdonnances(@PathVariable UUID dossierId) {
        return ResponseEntity.ok(documentService.getOrdonnances(dossierId));
    }

    // GET /api/documents/dossier/{dossierId}/resultats
    @GetMapping("/dossier/{dossierId}/resultats")
    @PreAuthorize("hasAnyAuthority('MEDECIN', 'SECRETAIRE', 'ADMIN', 'PATIENT')")
    public ResponseEntity<List<DocumentResponseDTO>> getResultats(@PathVariable UUID dossierId) {
        return ResponseEntity.ok(documentService.getResultats(dossierId));
    }

    // GET /api/documents/dossier/{dossierId}
    @GetMapping("/dossier/{dossierId}")
    @PreAuthorize("hasAnyAuthority('MEDECIN', 'SECRETAIRE', 'ADMIN', 'PATIENT')")
    public ResponseEntity<List<DocumentResponseDTO>> getAll(@PathVariable UUID dossierId) {
        return ResponseEntity.ok(documentService.getAll(dossierId));
    }

    // POST /api/documents/dossier/{dossierId}
    @PostMapping("/dossier/{dossierId}")
    @PreAuthorize("hasAnyAuthority('MEDECIN', 'SECRETAIRE', 'ADMIN')")
    public ResponseEntity<DocumentResponseDTO> creer(
            @PathVariable UUID dossierId,
            @Valid @RequestBody DocumentRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(documentService.creer(dossierId, dto));
    }

    // PUT /api/documents/{id}
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('MEDECIN', 'SECRETAIRE', 'ADMIN')")
    public ResponseEntity<DocumentResponseDTO> modifier(
            @PathVariable UUID id,
            @Valid @RequestBody DocumentRequestDTO dto) {
        return ResponseEntity.ok(documentService.modifier(id, dto));
    }

    // DELETE /api/documents/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('MEDECIN', 'ADMIN')")
    public ResponseEntity<Void> supprimer(@PathVariable UUID id) {
        documentService.supprimer(id);
        return ResponseEntity.noContent().build();
    }

    // PUT /api/documents/{id}/visibilite
    @PutMapping("/{id}/visibilite")
    @PreAuthorize("hasAnyAuthority('MEDECIN', 'ADMIN')")
    public ResponseEntity<DocumentResponseDTO> toggleVisibilite(@PathVariable UUID id) {
        return ResponseEntity.ok(documentService.toggleVisibilite(id));
    }
}