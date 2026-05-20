package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.plantraitement.PlanTraitementRequestDTO;
import com.oncoassist.oncoassist.model.dto.plantraitement.PlanTraitementResponseDTO;
import com.oncoassist.oncoassist.model.entity.Document;
import com.oncoassist.oncoassist.model.entity.DossierMedical;
import com.oncoassist.oncoassist.model.entity.Medecin;
import com.oncoassist.oncoassist.model.entity.PlanTraitement;
import com.oncoassist.oncoassist.model.entity.enums.DocTypeEnum;
import com.oncoassist.oncoassist.repository.DocumentRepository;
import com.oncoassist.oncoassist.repository.DossierMedicalRepository;
import com.oncoassist.oncoassist.repository.MedecinRepository;
import com.oncoassist.oncoassist.repository.PlanTraitementRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlanTraitementService {

    private final PlanTraitementRepository planTraitementRepository;
    private final DossierMedicalRepository dossierMedicalRepository;
    private final MedecinRepository medecinRepository;
    private final DocumentRepository documentRepository;

    // ─────────────────────────────────────────────────────────
    // CRÉER — orchestre 2 tables :
    //   1. plans_traitement  → la séance
    //   2. documents         → l'ordonnance (si remplie)
    //
    // ⚠️ Le RendezVous est créé SÉPARÉMENT via le bouton
    //    "Demander RDV Secrétaire" → POST /api/rendez-vous/demander
    //    Ce n'est PAS fait ici.
    // ─────────────────────────────────────────────────────────
    @Transactional
    public PlanTraitementResponseDTO creer(UUID dossierId, PlanTraitementRequestDTO dto) {

        DossierMedical dossier = dossierMedicalRepository.findById(dossierId)
                .orElseThrow(() -> new RuntimeException("Dossier introuvable : " + dossierId));

        Medecin medecin = medecinRepository.findById(dto.getMedecinId())
                .orElseThrow(() -> new RuntimeException("Médecin introuvable : " + dto.getMedecinId()));

        // ── 1. Créer le PlanTraitement ────────────────────────
        PlanTraitement plan = new PlanTraitement();
        plan.setDossierMedical(dossier);
        plan.setAuteur(medecin);
        mapRequestToEntity(dto, plan);
        PlanTraitement savedPlan = planTraitementRepository.save(plan);

        // ── 2. Créer le Document ordonnance si remplie ────────
        Document savedDoc = null;
        if (dto.getOrdonnance() != null && !dto.getOrdonnance().isBlank()) {
            savedDoc = new Document();
            savedDoc.setNom("Ordonnance - " + dto.getEtape() + " - " + dto.getDateConsultation());
            savedDoc.setType(DocTypeEnum.ORDONNANCE);
            savedDoc.setCheminFichier(dto.getOrdonnance()); // contenu texte stocké ici
            savedDoc.setDateAjout(LocalDate.now());
            savedDoc.setPartagePatient(
                    Boolean.TRUE.equals(dto.getOrdonnanceVisiblePatient())
            );
            savedDoc.setDossierMedical(dossier);
            savedDoc = documentRepository.save(savedDoc);
        }

        return toDTO(savedPlan, savedDoc);
    }

    // ─────────────────────────────────────────────────────────
    // GET toute la timeline d'un dossier
    // ─────────────────────────────────────────────────────────
    @Transactional
    public List<PlanTraitementResponseDTO> getByDossier(UUID dossierId) {
        if (!dossierMedicalRepository.existsById(dossierId)) {
            throw new RuntimeException("Dossier introuvable : " + dossierId);
        }

        List<PlanTraitement> plans = planTraitementRepository
                .findByDossierMedicalIdOrderByDateDesc(dossierId);

        // Charger toutes les ordonnances du dossier pour les associer
        List<Document> ordonnances = documentRepository
                .findByDossierMedicalIdAndType(dossierId, DocTypeEnum.ORDONNANCE);

        return plans.stream().map(p -> {
            // Associer l'ordonnance du même jour si elle existe
            Document doc = ordonnances.stream()
                    .filter(d -> d.getDateAjout() != null
                            && d.getDateAjout().equals(p.getDateConsultation()))
                    .findFirst()
                    .orElse(null);
            return toDTO(p, doc);
        }).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────
    // MODIFIER une séance
    // ─────────────────────────────────────────────────────────
    @Transactional
    public PlanTraitementResponseDTO modifier(UUID id, PlanTraitementRequestDTO dto) {
        PlanTraitement plan = planTraitementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan introuvable : " + id));

        mapRequestToEntity(dto, plan);
        PlanTraitement saved = planTraitementRepository.save(plan);

        // Mettre à jour l'ordonnance si fournie
        Document savedDoc = null;
        if (dto.getOrdonnance() != null && !dto.getOrdonnance().isBlank()) {
            List<Document> existing = documentRepository
                    .findByDossierMedicalIdAndType(
                            plan.getDossierMedical().getId(), DocTypeEnum.ORDONNANCE
                    );
            savedDoc = existing.stream()
                    .filter(d -> d.getDateAjout() != null
                            && d.getDateAjout().equals(plan.getDateConsultation()))
                    .findFirst()
                    .orElse(new Document());

            if (savedDoc.getId() == null) {
                savedDoc.setNom("Ordonnance - " + dto.getEtape() + " - " + dto.getDateConsultation());
                savedDoc.setType(DocTypeEnum.ORDONNANCE);
                savedDoc.setDateAjout(LocalDate.now());
                savedDoc.setDossierMedical(plan.getDossierMedical());
            }
            savedDoc.setCheminFichier(dto.getOrdonnance());
            savedDoc.setPartagePatient(Boolean.TRUE.equals(dto.getOrdonnanceVisiblePatient()));
            savedDoc = documentRepository.save(savedDoc);
        }

        return toDTO(saved, savedDoc);
    }

    // ─────────────────────────────────────────────────────────
    // SUPPRIMER
    // ─────────────────────────────────────────────────────────
    @Transactional
    public void supprimer(UUID id) {
        planTraitementRepository.deleteById(id);
    }

    // ─────────────────────────────────────────────────────────
    // MAPPER Request → Entity
    // ─────────────────────────────────────────────────────────
    private void mapRequestToEntity(PlanTraitementRequestDTO dto, PlanTraitement plan) {
        plan.setDateConsultation(dto.getDateConsultation());
        plan.setEtape(dto.getEtape());
        plan.setStatut(dto.getStatut() != null ? dto.getStatut() : "fait");
        plan.setVisiblePatient(Boolean.TRUE.equals(dto.getVisiblePatient()));
        plan.setProchaineEtape(dto.getProchaineEtape());
    }

    // ─────────────────────────────────────────────────────────
    // MAPPER Entity → ResponseDTO
    // ─────────────────────────────────────────────────────────
    private PlanTraitementResponseDTO toDTO(PlanTraitement p, Document doc) {
        PlanTraitementResponseDTO dto = new PlanTraitementResponseDTO();
        dto.setId(p.getId());
        dto.setDateConsultation(p.getDateConsultation());
        dto.setEtape(p.getEtape());
        dto.setStatut(p.getStatut());
        dto.setVisiblePatient(p.getVisiblePatient());
        dto.setProchaineEtape(p.getProchaineEtape());

        if (p.getAuteur() != null) {
            dto.setAuteurId(p.getAuteur().getId());
            dto.setAuteurNom(p.getAuteur().getNom());
            dto.setAuteurPrenom(p.getAuteur().getPrenom());
        }

        if (doc != null) {
            dto.setOrdonnanceId(doc.getId());
            dto.setOrdonnanceContenu(doc.getCheminFichier());
            dto.setOrdonnanceVisiblePatient(doc.getPartagePatient());
        }

        return dto;
    }
}