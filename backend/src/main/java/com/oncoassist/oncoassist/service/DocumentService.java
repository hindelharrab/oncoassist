package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.document.DocumentRequestDTO;
import com.oncoassist.oncoassist.model.dto.document.DocumentResponseDTO;
import com.oncoassist.oncoassist.model.entity.Document;
import com.oncoassist.oncoassist.model.entity.DossierMedical;
import com.oncoassist.oncoassist.model.entity.enums.DocTypeEnum;
import com.oncoassist.oncoassist.repository.DocumentRepository;
import com.oncoassist.oncoassist.repository.DossierMedicalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DocumentService {

    private final DocumentRepository      documentRepository;
    private final DossierMedicalRepository dossierMedicalRepository;

    private static final List<DocTypeEnum> TYPES_RESULTATS = List.of(
            DocTypeEnum.RESULTAT_MANUEL,
            DocTypeEnum.RESULTAT_MAMMOGRAPHIE,
            DocTypeEnum.RESULTAT_ECHOGRAPHIE,
            DocTypeEnum.RESULTAT_IRM,
            DocTypeEnum.RESULTAT_BIOPSIE
    );

    @Transactional
    public List<DocumentResponseDTO> getOrdonnances(UUID dossierId) {
        verifierDossier(dossierId);
        return documentRepository
                .findByDossierMedicalIdAndType(dossierId, DocTypeEnum.ORDONNANCE)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ── Retourne TOUS les types de résultats d'examens ─────────
    @Transactional
    public List<DocumentResponseDTO> getResultats(UUID dossierId) {
        verifierDossier(dossierId);
        return documentRepository
                .findByDossierMedicalIdAndTypeIn(dossierId, TYPES_RESULTATS)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public List<DocumentResponseDTO> getAll(UUID dossierId) {
        verifierDossier(dossierId);
        return documentRepository
                .findByDossierMedicalIdOrderByDateDesc(dossierId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ── Créer — avec déduplication sur examenSourceId ──────────
    @Transactional
    public DocumentResponseDTO creer(UUID dossierId, DocumentRequestDTO dto) {
        DossierMedical dossier = verifierDossier(dossierId);

        // Si un document existe déjà pour cet examen → retourner l'existant
        if (dto.getExamenSourceId() != null) {
            var existant = documentRepository.findByExamenSourceId(dto.getExamenSourceId());
            if (existant.isPresent()) {
                return toDTO(existant.get());
            }
        }

        Document doc = new Document();
        doc.setNom(dto.getNom());
        doc.setType(dto.getType());
        doc.setCheminFichier(dto.getContenu()); // JSON sérialisé des données de l'examen
        doc.setDateAjout(LocalDate.now());
        doc.setPartagePatient(Boolean.TRUE.equals(dto.getPartagePatient()));
        doc.setDossierMedical(dossier);
        doc.setExamenSourceId(dto.getExamenSourceId());
        doc.setExamenSourceType(dto.getExamenSourceType());

        return toDTO(documentRepository.save(doc));
    }

    @Transactional
    public DocumentResponseDTO modifier(UUID id, DocumentRequestDTO dto) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document introuvable : " + id));
        doc.setNom(dto.getNom());
        doc.setCheminFichier(dto.getContenu());
        doc.setPartagePatient(Boolean.TRUE.equals(dto.getPartagePatient()));
        return toDTO(documentRepository.save(doc));
    }

    @Transactional
    public void supprimer(UUID id) {
        documentRepository.deleteById(id);
    }

    @Transactional
    public DocumentResponseDTO toggleVisibilite(UUID id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document introuvable : " + id));
        doc.setPartagePatient(!Boolean.TRUE.equals(doc.getPartagePatient()));
        return toDTO(documentRepository.save(doc));
    }

    private DossierMedical verifierDossier(UUID dossierId) {
        return dossierMedicalRepository.findById(dossierId)
                .orElseThrow(() -> new RuntimeException("Dossier introuvable : " + dossierId));
    }

    private DocumentResponseDTO toDTO(Document d) {
        DocumentResponseDTO dto = new DocumentResponseDTO();
        dto.setId(d.getId());
        dto.setNom(d.getNom());
        dto.setType(d.getType());
        dto.setContenu(d.getCheminFichier()); // contenu JSON ou texte
        dto.setDateAjout(d.getDateAjout());
        dto.setPartagePatient(d.getPartagePatient());
        dto.setExamenSourceId(d.getExamenSourceId());
        dto.setExamenSourceType(d.getExamenSourceType());

        // Extraire l'étape depuis le nom
        if (d.getNom() != null && d.getNom().contains(" - ")) {
            String[] parts = d.getNom().split(" - ");
            if (parts.length >= 2) dto.setEtape(parts[1]);
        }

        return dto;
    }
}