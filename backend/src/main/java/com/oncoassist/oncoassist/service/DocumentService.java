package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.document.DocumentRequestDTO;
import com.oncoassist.oncoassist.model.dto.document.DocumentResponseDTO;
import com.oncoassist.oncoassist.model.entity.Document;
import com.oncoassist.oncoassist.model.entity.DossierMedical;
import com.oncoassist.oncoassist.model.entity.enums.DocTypeEnum;
import com.oncoassist.oncoassist.model.entity.enums.NotificationCategorie;
import com.oncoassist.oncoassist.model.entity.enums.NotificationPriorite;
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

    private final DocumentRepository       documentRepository;
    private final DossierMedicalRepository dossierMedicalRepository;
    private final NotificationService      notificationService;

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
        return documentRepository.findByDossierMedicalIdAndType(dossierId, DocTypeEnum.ORDONNANCE)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public List<DocumentResponseDTO> getResultats(UUID dossierId) {
        verifierDossier(dossierId);
        return documentRepository.findByDossierMedicalIdAndTypeIn(dossierId, TYPES_RESULTATS)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public List<DocumentResponseDTO> getAll(UUID dossierId) {
        verifierDossier(dossierId);
        return documentRepository.findByDossierMedicalIdOrderByDateDesc(dossierId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public DocumentResponseDTO creer(UUID dossierId, DocumentRequestDTO dto) {
        DossierMedical dossier = verifierDossier(dossierId);

        if (dto.getExamenSourceId() != null) {
            var existant = documentRepository.findByExamenSourceId(dto.getExamenSourceId());
            if (existant.isPresent()) return toDTO(existant.get());
        }

        Document doc = new Document();
        doc.setNom(dto.getNom());
        doc.setType(dto.getType());
        doc.setCheminFichier(dto.getContenu());
        doc.setDateAjout(LocalDate.now());
        doc.setPartagePatient(Boolean.TRUE.equals(dto.getPartagePatient()));
        doc.setDossierMedical(dossier);
        doc.setExamenSourceId(dto.getExamenSourceId());
        doc.setExamenSourceType(dto.getExamenSourceType());

        Document saved = documentRepository.save(doc);

        // 🔔 Notif patient si document partagé dès la création
        if (Boolean.TRUE.equals(dto.getPartagePatient()) && dossier.getPatient() != null) {
            _notifierDocumentPartage(dossier.getPatient().getId(), saved);
        }

        return toDTO(saved);
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

    // ── toggleVisibilite — 🔔 notif patient quand partagé ─
    @Transactional
    public DocumentResponseDTO toggleVisibilite(UUID id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document introuvable : " + id));

        boolean wasShared = Boolean.TRUE.equals(doc.getPartagePatient());
        doc.setPartagePatient(!wasShared);
        Document saved = documentRepository.save(doc);

        // Notifier seulement quand on passe de privé → partagé
        if (!wasShared && Boolean.TRUE.equals(saved.getPartagePatient())) {
            DossierMedical dossier = saved.getDossierMedical();
            if (dossier != null && dossier.getPatient() != null) {
                _notifierDocumentPartage(dossier.getPatient().getId(), saved);
            }
        }

        return toDTO(saved);
    }

    // ── Helper notif document ─────────────────────────────
    private void _notifierDocumentPartage(UUID patientId, Document doc) {
        String typeLabel = switch (doc.getType()) {
            case ORDONNANCE             -> "une ordonnance 💊";
            case RESULTAT_MAMMOGRAPHIE  -> "un résultat de mammographie 🔬";
            case RESULTAT_BIOPSIE       -> "un résultat de biopsie 🧬";
            case RESULTAT_ECHOGRAPHIE   -> "un résultat d'échographie 📡";
            case RESULTAT_IRM           -> "un résultat d'IRM 🧲";
            case RESULTAT_MANUEL        -> "un résultat d'examen clinique 📋";
            default                     -> "un document médical 📄";
        };

        notificationService.creerPourPatient(
                patientId,
                NotificationCategorie.dossier,
                NotificationPriorite.NORMALE,
                "Nouveau document disponible",
                "Votre médecin vous a partagé " + typeLabel + ".",
                "/documents"
        );
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
        dto.setContenu(d.getCheminFichier());
        dto.setDateAjout(d.getDateAjout());
        dto.setPartagePatient(d.getPartagePatient());
        dto.setExamenSourceId(d.getExamenSourceId());
        dto.setExamenSourceType(d.getExamenSourceType());
        if (d.getNom() != null && d.getNom().contains(" - ")) {
            String[] parts = d.getNom().split(" - ");
            if (parts.length >= 2) dto.setEtape(parts[1]);
        }
        return dto;
    }
}