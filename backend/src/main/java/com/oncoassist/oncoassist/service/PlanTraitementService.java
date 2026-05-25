package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.plantraitement.PlanTraitementRequestDTO;
import com.oncoassist.oncoassist.model.dto.plantraitement.PlanTraitementResponseDTO;
import com.oncoassist.oncoassist.model.entity.Document;
import com.oncoassist.oncoassist.model.entity.DossierMedical;
import com.oncoassist.oncoassist.model.entity.Medecin;
import com.oncoassist.oncoassist.model.entity.PlanTraitement;
import com.oncoassist.oncoassist.model.entity.enums.DocTypeEnum;
import com.oncoassist.oncoassist.model.entity.enums.NotificationCategorie;
import com.oncoassist.oncoassist.model.entity.enums.NotificationPriorite;
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
    private final MedecinRepository        medecinRepository;
    private final DocumentRepository       documentRepository;
    private final NotificationService      notificationService;

    // ── CRÉER ────────────────────────────────────────────
    @Transactional
    public PlanTraitementResponseDTO creer(UUID dossierId, PlanTraitementRequestDTO dto) {

        DossierMedical dossier = dossierMedicalRepository.findById(dossierId)
                .orElseThrow(() -> new RuntimeException("Dossier introuvable : " + dossierId));

        Medecin medecin = medecinRepository.findById(dto.getMedecinId())
                .orElseThrow(() -> new RuntimeException("Médecin introuvable : " + dto.getMedecinId()));

        PlanTraitement plan = new PlanTraitement();
        plan.setDossierMedical(dossier);
        plan.setAuteur(medecin);
        mapRequestToEntity(dto, plan);
        PlanTraitement savedPlan = planTraitementRepository.save(plan);

        Document savedDoc = null;
        if (dto.getOrdonnance() != null && !dto.getOrdonnance().isBlank()) {
            savedDoc = new Document();
            savedDoc.setNom("Ordonnance - " + dto.getEtape() + " - " + dto.getDateConsultation());
            savedDoc.setType(DocTypeEnum.ORDONNANCE);
            savedDoc.setCheminFichier(dto.getOrdonnance());
            savedDoc.setDateAjout(LocalDate.now());
            savedDoc.setPartagePatient(Boolean.TRUE.equals(dto.getOrdonnanceVisiblePatient()));
            savedDoc.setDossierMedical(dossier);
            savedDoc = documentRepository.save(savedDoc);

            // 🔔 Notif patient si ordonnance visible
            if (Boolean.TRUE.equals(dto.getOrdonnanceVisiblePatient())
                    && dossier.getPatient() != null) {
                notificationService.creerPourPatient(
                        dossier.getPatient().getId(),
                        NotificationCategorie.dossier,
                        NotificationPriorite.NORMALE,
                        "Nouvelle ordonnance disponible 💊",
                        "Une ordonnance pour \"" + dto.getEtape() + "\" a été ajoutée à votre dossier.",
                        "/documents"
                );
            }
        }

        // 🔔 Notif patient — nouvelle étape planifiée (statut "à venir")
        if ("à venir".equals(dto.getStatut()) && dossier.getPatient() != null) {
            notificationService.creerPourPatient(
                    dossier.getPatient().getId(),
                    NotificationCategorie.dossier,
                    NotificationPriorite.NORMALE,
                    "Nouvelle étape planifiée 🗓️",
                    "Une nouvelle étape a été ajoutée à votre parcours : \""
                            + dto.getEtape() + "\". En attente de confirmation.",
                    "/suivi"
            );
        }

        return toDTO(savedPlan, savedDoc);
    }

    // ── GET TIMELINE ────────────────────────────────────
    @Transactional
    public List<PlanTraitementResponseDTO> getByDossier(UUID dossierId) {
        if (!dossierMedicalRepository.existsById(dossierId))
            throw new RuntimeException("Dossier introuvable : " + dossierId);

        List<PlanTraitement> plans = planTraitementRepository
                .findByDossierMedicalIdOrderByDateDesc(dossierId);
        List<Document> ordonnances = documentRepository
                .findByDossierMedicalIdAndType(dossierId, DocTypeEnum.ORDONNANCE);

        return plans.stream().map(p -> {
            Document doc = ordonnances.stream()
                    .filter(d -> d.getDateAjout() != null
                            && d.getDateAjout().equals(p.getDateConsultation()))
                    .findFirst().orElse(null);
            return toDTO(p, doc);
        }).collect(Collectors.toList());
    }

    // ── MODIFIER ─────────────────────────────────────────
    @Transactional
    public PlanTraitementResponseDTO modifier(UUID id, PlanTraitementRequestDTO dto) {
        PlanTraitement plan = planTraitementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan introuvable : " + id));

        String ancienStatut = plan.getStatut();
        mapRequestToEntity(dto, plan);
        PlanTraitement saved = planTraitementRepository.save(plan);

        // 🔔 Notif patient — étape passée à "fait"
        if (!"fait".equals(ancienStatut) && "fait".equals(dto.getStatut())
                && saved.getDossierMedical().getPatient() != null) {
            notificationService.creerPourPatient(
                    saved.getDossierMedical().getPatient().getId(),
                    NotificationCategorie.dossier,
                    NotificationPriorite.NORMALE,
                    "Étape validée ✅",
                    "L'étape \"" + saved.getEtape() + "\" de votre parcours a été enregistrée.",
                    "/suivi"
            );
        }

        Document savedDoc = null;
        if (dto.getOrdonnance() != null && !dto.getOrdonnance().isBlank()) {
            List<Document> existing = documentRepository
                    .findByDossierMedicalIdAndType(plan.getDossierMedical().getId(), DocTypeEnum.ORDONNANCE);
            savedDoc = existing.stream()
                    .filter(d -> d.getDateAjout() != null
                            && d.getDateAjout().equals(plan.getDateConsultation()))
                    .findFirst().orElse(new Document());

            if (savedDoc.getId() == null) {
                savedDoc.setNom("Ordonnance - " + dto.getEtape() + " - " + dto.getDateConsultation());
                savedDoc.setType(DocTypeEnum.ORDONNANCE);
                savedDoc.setDateAjout(LocalDate.now());
                savedDoc.setDossierMedical(plan.getDossierMedical());
            }
            savedDoc.setCheminFichier(dto.getOrdonnance());
            savedDoc.setPartagePatient(Boolean.TRUE.equals(dto.getOrdonnanceVisiblePatient()));
            savedDoc = documentRepository.save(savedDoc);

            // 🔔 Notif patient si ordonnance visible
            if (Boolean.TRUE.equals(dto.getOrdonnanceVisiblePatient())
                    && plan.getDossierMedical().getPatient() != null) {
                notificationService.creerPourPatient(
                        plan.getDossierMedical().getPatient().getId(),
                        NotificationCategorie.dossier,
                        NotificationPriorite.NORMALE,
                        "Ordonnance mise à jour 💊",
                        "Votre ordonnance pour \"" + dto.getEtape() + "\" a été mise à jour.",
                        "/documents"
                );
            }
        }

        return toDTO(saved, savedDoc);
    }

    // ── SUPPRIMER ─────────────────────────────────────────
    @Transactional
    public void supprimer(UUID id) {
        planTraitementRepository.deleteById(id);
    }

    // ── MAPPER ────────────────────────────────────────────
    private void mapRequestToEntity(PlanTraitementRequestDTO dto, PlanTraitement plan) {
        plan.setDateConsultation(dto.getDateConsultation());
        plan.setEtape(dto.getEtape());
        plan.setStatut(dto.getStatut() != null ? dto.getStatut() : "fait");
        plan.setVisiblePatient(Boolean.TRUE.equals(dto.getVisiblePatient()));
        plan.setProchaineEtape(dto.getProchaineEtape());
    }

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