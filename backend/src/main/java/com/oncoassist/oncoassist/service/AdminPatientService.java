package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.admin.AdminPatientDetailDTO;
import com.oncoassist.oncoassist.model.entity.*;
import com.oncoassist.oncoassist.model.entity.enums.StatutClinique;
import com.oncoassist.oncoassist.model.entity.enums.StatutDossierEnum;
import com.oncoassist.oncoassist.model.entity.enums.BIRADSEnum;
import com.oncoassist.oncoassist.model.entity.AttributionQuestionnaire;
import com.oncoassist.oncoassist.repository.PatientRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service dédié à l'espace Admin.
 * Ne retourne AUCUNE donnée médicale sensible (examens, antécédents, résultats).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminPatientService {

    private final PatientRepository    patientRepository;
    private final PatientService       patientService; // pour calculerStatut

    private static final DateTimeFormatter FMT_DATE =
            DateTimeFormatter.ofPattern("dd MMM yyyy", java.util.Locale.FRENCH);
    private static final DateTimeFormatter FMT_DATETIME =
            DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm", java.util.Locale.FRENCH);

    // ── Tous les patients ─────────────────────────────────────
    public List<AdminPatientDetailDTO> findAll() {
        return patientRepository.findAll()
                .stream()
                .map(this::toAdminDTO)
                .collect(Collectors.toList());
    }

    // ── Un patient par ID ─────────────────────────────────────
    public AdminPatientDetailDTO findById(UUID id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Patient introuvable : " + id));
        return toAdminDTO(patient);
    }

    // ── Recherche par nom/prénom ──────────────────────────────
    public List<AdminPatientDetailDTO> rechercher(String nom) {
        return patientRepository
                .findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(nom, nom)
                .stream()
                .map(this::toAdminDTO)
                .collect(Collectors.toList());
    }

    // ── Mapper principal ──────────────────────────────────────
    private AdminPatientDetailDTO toAdminDTO(Patient patient) {
        AdminPatientDetailDTO dto = new AdminPatientDetailDTO();

        // Identité
        dto.setId(patient.getId());
        dto.setNom(patient.getNom());
        dto.setPrenom(patient.getPrenom());
        dto.setEmail(patient.getEmail());
        dto.setTelephone(patient.getTelephone());
        dto.setDateNaissance(patient.getDateNaissance());
        dto.setAdresse(patient.getAdresse());
        dto.setPersonneConfiance(patient.getPersonneConfiance());
        dto.setPhotoProfil(patient.getPhotoProfil());

        // Âge calculé
        if (patient.getDateNaissance() != null) {
            dto.setAge(Period.between(patient.getDateNaissance(), LocalDate.now()).getYears());
        }

        // Dossier médical — statut administratif uniquement
        DossierMedical dossier = patient.getDossierMedical();
        if (dossier != null) {
            dto.setDossierMedicalId(dossier.getId());
            dto.setStatutDossier(dossier.getStatut());
            dto.setDateCreationDossier(dossier.getDateCreation());

            // Compteurs (pas de contenu)
            dto.setNombreExamens(
                    dossier.getExamens() != null ? dossier.getExamens().size() : 0);
            dto.setNombreDocuments(
                    dossier.getDocuments() != null ? dossier.getDocuments().size() : 0);
        }

        // Statut clinique global (calculé)
        dto.setStatut(calculerStatut(patient));

        // Médecin référent
        if (patient.getPrisesEnCharge() != null) {
            patient.getPrisesEnCharge().stream()
                    .filter(pec -> pec.getDateFin() == null)
                    .findFirst()
                    .ifPresent(pec -> {
                        if (pec.getMedecin() != null) {
                            Medecin m = pec.getMedecin();
                            dto.setMedecinId(m.getId());
                            dto.setMedecinRef(m.getPrenom() + " " + m.getNom());
                            dto.setMedecinEmail(m.getEmail());
                            dto.setMedecinTelephone(m.getTelephone());
                            dto.setMedecinPhoto(m.getPhotoProfil()); // ← AJOUT
                        }
                    });
        }

        // Rendez-vous — motif + statut uniquement, pas de notes médicales
        if (patient.getRendezVous() != null && !patient.getRendezVous().isEmpty()) {
            List<RendezVous> rdvs = patient.getRendezVous().stream()
                    .filter(r -> r.getDate() != null)
                    .sorted(Comparator.comparing(RendezVous::getDate).reversed())
                    .collect(Collectors.toList());

            dto.setNombreRendezVous(rdvs.size());

            // Dernière consultation passée
            rdvs.stream()
                    .filter(r -> r.getDate().isBefore(java.time.LocalDateTime.now()))
                    .findFirst()
                    .ifPresent(r -> dto.setDerniereConsultation(
                            r.getDate().toLocalDate().format(FMT_DATE)));

            // Prochain rendez-vous futur
            rdvs.stream()
                    .filter(r -> r.getDate().isAfter(java.time.LocalDateTime.now()))
                    .min(Comparator.comparing(RendezVous::getDate))
                    .ifPresent(r -> dto.setProchainRendezVous(
                            r.getDate().format(FMT_DATETIME)));

            // 3 derniers RDV (résumé admin)
            List<AdminPatientDetailDTO.AdminRdvSummary> summaries = rdvs.stream()
                    .limit(3)
                    .map(r -> {
                        AdminPatientDetailDTO.AdminRdvSummary s =
                                new AdminPatientDetailDTO.AdminRdvSummary();
                        s.setId(r.getId());
                        s.setDate(r.getDate().format(FMT_DATETIME));
                        s.setMotif(r.getMotif());
                        s.setStatut(r.getStatut() != null ? r.getStatut().name() : "—");
                        s.setLieu(r.getLieu());
                        if (r.getMedecin() != null) {
                            s.setMedecin(r.getMedecin().getPrenom()
                                    + " " + r.getMedecin().getNom());
                            s.setMedecinPhoto(r.getMedecin().getPhotoProfil()); // ← AJOUT
                        }
                        return s;
                    })
                    .collect(Collectors.toList());
            dto.setDerniersRendezVous(summaries);
        } else {
            dto.setNombreRendezVous(0);
            dto.setDerniersRendezVous(Collections.emptyList());
        }

        return dto;
    }

    // ── Statut clinique (même logique que PatientService) ─────
    private StatutClinique calculerStatut(Patient patient) {
        DossierMedical dossier = patient.getDossierMedical();
        if (dossier == null) return StatutClinique.NOUVELLE;
        if (dossier.getStatut() == StatutDossierEnum.ARCHIVE)
            return StatutClinique.ARCHIVEE;
        if (dossier.getExamens() == null || dossier.getExamens().isEmpty())
            return StatutClinique.NOUVELLE;

        boolean critique = dossier.getExamens().stream()
                .filter(e -> e instanceof Mammographie)
                .map(e -> (Mammographie) e)
                .anyMatch(m -> m.getScoreBIRADS() != null &&
                        (m.getScoreBIRADS() == BIRADSEnum.BIRADS_4A
                                || m.getScoreBIRADS() == BIRADSEnum.BIRADS_4B
                                || m.getScoreBIRADS() == BIRADSEnum.BIRADS_4C
                                || m.getScoreBIRADS() == BIRADSEnum.BIRADS_5
                                || m.getScoreBIRADS() == BIRADSEnum.BIRADS_6));
        if (critique) return StatutClinique.CRITIQUE;

        boolean surveiller = dossier.getExamens().stream()
                .filter(e -> e instanceof Mammographie)
                .map(e -> (Mammographie) e)
                .anyMatch(m -> m.getScoreBIRADS() == BIRADSEnum.BIRADS_3);
        if (surveiller) return StatutClinique.A_SURVEILLER;

        boolean suiviActif = patient.getAttributions() != null
                && patient.getAttributions().stream()
                .anyMatch(AttributionQuestionnaire::getActif);
        if (suiviActif) return StatutClinique.EN_SUIVI;

        return StatutClinique.STABLE;
    }
}