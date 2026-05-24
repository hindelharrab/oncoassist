package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.dto.admin.AdminMedecinDetailDTO;
import com.oncoassist.oncoassist.model.entity.DisponibiliteMedecin;
import com.oncoassist.oncoassist.model.entity.DocumentMedecin;
import com.oncoassist.oncoassist.model.entity.Medecin;
import com.oncoassist.oncoassist.model.entity.enums.RoleEnum;
import com.oncoassist.oncoassist.repository.DisponibiliteMedecinRepository;
import com.oncoassist.oncoassist.repository.DocumentMedecinRepository;
import com.oncoassist.oncoassist.repository.MedecinRepository;
import com.oncoassist.oncoassist.service.AdminMedecinService;
import com.oncoassist.oncoassist.service.FileStorageService;
import com.oncoassist.oncoassist.service.MedecinService;
import jakarta.persistence.EntityNotFoundException;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/medecins")
@RequiredArgsConstructor
public class AdminMedecinController {

    private final AdminMedecinService            adminMedecinService;
    private final MedecinService                 medecinService;
    private final MedecinRepository              medecinRepository;
    private final DocumentMedecinRepository      documentMedecinRepository;
    private final DisponibiliteMedecinRepository disponibiliteRepository;
    private final FileStorageService             fileStorageService;

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<AdminMedecinDetailDTO>> findAll() {
        return ResponseEntity.ok(adminMedecinService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<AdminMedecinDetailDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(adminMedecinService.findById(id));
    }

    // ── Créer un médecin ──────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<AdminMedecinDetailDTO> creer(@RequestBody CreateMedecinRequest req) {
        Medecin m = new Medecin();
        m.setNom(req.getNom());
        m.setPrenom(req.getPrenom());
        m.setEmail(req.getEmail());
        m.setTelephone(req.getTelephone());
        m.setNumeroOrdre(req.getNumeroOrdre() != null && !req.getNumeroOrdre().isBlank()
                ? req.getNumeroOrdre() : "ORD-" + System.currentTimeMillis());
        m.setMotDePasse(req.getMotDePasse());
        m.setRole(RoleEnum.MEDECIN);
        Medecin saved = medecinService.creer(m, req.getSpecialiteId());
        return ResponseEntity.ok(adminMedecinService.findById(saved.getId()));
    }

    // ── Disponibilités par jour ───────────────────────────────
    @PutMapping("/{id}/disponibilites")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Transactional
    public ResponseEntity<Void> updateDisponibilites(
            @PathVariable UUID id,
            @RequestBody List<DisponibiliteRequest> dispos) {

        Medecin m = medecinRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Médecin introuvable"));

        // Supprimer les anciennes et recréer
        disponibiliteRepository.deleteByMedecinId(id);
        disponibiliteRepository.flush();

        for (DisponibiliteRequest req : dispos) {
            DisponibiliteMedecin d = new DisponibiliteMedecin();
            d.setMedecin(m);
            d.setJour(req.getJour());
            d.setHeureDebut(req.getHeureDebut());
            d.setHeureFin(req.getHeureFin());
            disponibiliteRepository.save(d);
        }
        return ResponseEntity.ok().build();
    }

    // ── Documents ─────────────────────────────────────────────
    @PostMapping(value = "/{id}/documents", consumes = "multipart/form-data")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> addDocument(
            @PathVariable UUID id,
            @RequestParam("nom") String nom,
            @RequestParam("typeDocument") String typeDocument,
            @RequestParam(value = "fichier", required = false) MultipartFile fichier)
            throws IOException {

        Medecin m = medecinRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Médecin introuvable"));

        DocumentMedecin doc = new DocumentMedecin();
        doc.setNom(nom);
        doc.setTypeDocument(typeDocument);
        doc.setMedecin(m);

        if (fichier != null && !fichier.isEmpty()) {
            doc.setCheminFichier(fileStorageService.sauvegarderDocument(fichier));
            doc.setTailleFichier(formatSize(fichier.getSize()));
        }
        documentMedecinRepository.save(doc);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{medecinId}/documents/{docId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable UUID medecinId, @PathVariable UUID docId) {
        documentMedecinRepository.deleteById(docId);
        return ResponseEntity.noContent().build();
    }

    // ── Helpers ───────────────────────────────────────────────
    private String formatSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        return String.format("%.1f MB", bytes / (1024.0 * 1024));
    }

    // ── DTOs internes ─────────────────────────────────────────
    @Data public static class CreateMedecinRequest {
        private String nom, prenom, email, telephone, motDePasse, numeroOrdre;
        private UUID specialiteId;
    }

    @Data public static class DisponibiliteRequest {
        private String jour;
        private String heureDebut;
        private String heureFin;
    }
}