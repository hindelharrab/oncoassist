package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.document.DocumentRequestDTO;
import com.oncoassist.oncoassist.model.dto.document.DocumentResponseDTO;
import com.oncoassist.oncoassist.model.entity.Document;
import com.oncoassist.oncoassist.model.entity.DossierMedical;
import com.oncoassist.oncoassist.model.entity.enums.DocTypeEnum;
import com.oncoassist.oncoassist.repository.DocumentRepository;
import com.oncoassist.oncoassist.repository.DossierMedicalRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DossierMedicalRepository dossierMedicalRepository;

    // ─────────────────────────────────────────────────────────
    // GET toutes les ordonnances d'un dossier
    // ─────────────────────────────────────────────────────────
    @Transactional
    public List<DocumentResponseDTO> getOrdonnances(UUID dossierId) {
        verifierDossier(dossierId);
        return documentRepository
                .findByDossierMedicalIdAndType(dossierId, DocTypeEnum.ORDONNANCE)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────
    // GET tous les résultats d'un dossier
    // ─────────────────────────────────────────────────────────
    @Transactional
    public List<DocumentResponseDTO> getResultats(UUID dossierId) {
        verifierDossier(dossierId);
        return documentRepository
                .findByDossierMedicalIdAndType(dossierId, DocTypeEnum.RESULTAT)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────
    // GET tous les documents d'un dossier (tous types)
    // ─────────────────────────────────────────────────────────
    @Transactional
    public List<DocumentResponseDTO> getAll(UUID dossierId) {
        verifierDossier(dossierId);
        return documentRepository
                .findByDossierMedicalIdOrderByDateDesc(dossierId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────
    // CRÉER un document (ordonnance manuelle ou résultat)
    // ─────────────────────────────────────────────────────────
    @Transactional
    public DocumentResponseDTO creer(UUID dossierId, DocumentRequestDTO dto) {
        DossierMedical dossier = verifierDossier(dossierId);

        Document doc = new Document();
        doc.setNom(dto.getNom());
        doc.setType(dto.getType());
        doc.setCheminFichier(dto.getContenu()); // contenu texte stocké ici
        doc.setDateAjout(LocalDate.now());
        doc.setPartagePatient(dto.getPartagePatient() != null ? dto.getPartagePatient() : false);
        doc.setDossierMedical(dossier);

        return toDTO(documentRepository.save(doc));
    }

    // ─────────────────────────────────────────────────────────
    // MODIFIER (ex: éditer une note de résultat)
    // ─────────────────────────────────────────────────────────
    @Transactional
    public DocumentResponseDTO modifier(UUID id, DocumentRequestDTO dto) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document introuvable : " + id));

        doc.setNom(dto.getNom());
        doc.setCheminFichier(dto.getContenu());
        doc.setPartagePatient(dto.getPartagePatient() != null ? dto.getPartagePatient() : false);

        return toDTO(documentRepository.save(doc));
    }

    // ─────────────────────────────────────────────────────────
    // SUPPRIMER
    // ─────────────────────────────────────────────────────────
    @Transactional
    public void supprimer(UUID id) {
        documentRepository.deleteById(id);
    }

    // ─────────────────────────────────────────────────────────
    // TOGGLE visibilité patient
    // ─────────────────────────────────────────────────────────
    @Transactional
    public DocumentResponseDTO toggleVisibilite(UUID id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document introuvable : " + id));
        doc.setPartagePatient(!Boolean.TRUE.equals(doc.getPartagePatient()));
        return toDTO(documentRepository.save(doc));
    }

    // ─────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────
    private DossierMedical verifierDossier(UUID dossierId) {
        return dossierMedicalRepository.findById(dossierId)
                .orElseThrow(() -> new RuntimeException("Dossier introuvable : " + dossierId));
    }

    private DocumentResponseDTO toDTO(Document d) {
        DocumentResponseDTO dto = new DocumentResponseDTO();
        dto.setId(d.getId());
        dto.setNom(d.getNom());
        dto.setType(d.getType());
        dto.setContenu(d.getCheminFichier());
        dto.setDateAjout(d.getDateAjout());
        dto.setPartagePatient(d.getPartagePatient());

        // Extraire l'étape depuis le nom (ex: "Ordonnance - IRM - 2026-05-01" → "IRM")
        if (d.getNom() != null && d.getNom().contains(" - ")) {
            String[] parts = d.getNom().split(" - ");
            if (parts.length >= 2) {
                dto.setEtape(parts[1]);
            }
        }

        return dto;
    }
}