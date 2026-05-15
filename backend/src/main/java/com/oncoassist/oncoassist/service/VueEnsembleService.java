package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.VueEnsembleResponse;
import com.oncoassist.oncoassist.model.dto.VueEnsembleResponse.*;
import com.oncoassist.oncoassist.model.entity.*;
import com.oncoassist.oncoassist.model.entity.enums.StatutDossierEnum;
import com.oncoassist.oncoassist.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VueEnsembleService {

    private final PatientRepository       patientRepository;
    private final DossierMedicalRepository dossierMedicalRepository;
    private final RendezVousRepository    rendezVousRepository;
    private final PlanTraitementRepository planTraitementRepository;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    /* ════════════════════════════════════════════════════════════════
       Point d'entrée principal
    ════════════════════════════════════════════════════════════════ */
    public VueEnsembleResponse buildVueEnsemble(UUID patientId) {

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new NoSuchElementException("Patient introuvable: " + patientId));

        DossierMedical dossier = dossierMedicalRepository.findByPatientId(patientId)
                .orElseThrow(() -> new NoSuchElementException("Dossier médical introuvable pour le patient: " + patientId));

        return VueEnsembleResponse.builder()
                .patient(mapPatient(patient, dossier))
                .antecedentsMedicaux(mapAntecedentsMedicaux(dossier))
                .antecedentsFamiliaux(mapAntecedentsFamiliaux(dossier))
                .rendezVous(mapRendezVous(patientId))
                .examens(mapExamens(dossier))
                .timeline(buildTimeline(dossier))
                .build();
    }

    /* ════════════════════════════════════════════════════════════════
       Patient
    ════════════════════════════════════════════════════════════════ */
    private PatientSummaryDTO mapPatient(Patient patient, DossierMedical dossier) {

        // Médecins actifs (PriseEnCharge sans dateFin)
        List<MedecinSummaryDTO> medecins = patient.getPrisesEnCharge().stream()
                .filter(pec -> pec.getDateFin() == null)
                .map(pec -> {
                    Medecin m = pec.getMedecin();
                    return MedecinSummaryDTO.builder()
                            .id(m.getId())
                            .nom(m.getNom())
                            .prenom(m.getPrenom())
                            .specialite(m.getSpecialite() != null ? m.getSpecialite().getNom() : null)
                            .photoProfil(buildFileUrl(m.getPhotoProfil()))
                            .build();
                })
                .collect(Collectors.toList());

        int age = patient.getDateNaissance() != null
                ? Period.between(patient.getDateNaissance(), LocalDate.now()).getYears()
                : 0;

        return PatientSummaryDTO.builder()
                .id(patient.getId())
                .nom(patient.getNom())
                .prenom(patient.getPrenom())
                .age(age)
                .telephone(patient.getTelephone())
                .photoProfil(buildFileUrl(patient.getPhotoProfil()))
                .statut(dossier.getStatut().name())
                .medecins(medecins)
                .build();
    }

    /* ════════════════════════════════════════════════════════════════
       Antécédents
    ════════════════════════════════════════════════════════════════ */
    private List<AntecedentMedicalDTO> mapAntecedentsMedicaux(DossierMedical dossier) {
        if (dossier.getAntecedentsMedicaux() == null) return List.of();
        return dossier.getAntecedentsMedicaux().stream()
                .map(a -> AntecedentMedicalDTO.builder()
                        .id(a.getId())
                        .maladie(a.getMaladie())
                        .dateDiagnostic(a.getDateDiagnostic())
                        .statut(a.getStatut().name())
                        .traitements(a.getTraitements())
                        .build())
                .collect(Collectors.toList());
    }

    private List<AntecedentFamilialDTO> mapAntecedentsFamiliaux(DossierMedical dossier) {
        if (dossier.getAntecedentsFamiliaux() == null) return List.of();
        return dossier.getAntecedentsFamiliaux().stream()
                .map(a -> AntecedentFamilialDTO.builder()
                        .id(a.getId())
                        .lienFamilial(a.getLienFamilial().name())
                        .maladie(a.getMaladie())
                        .ageSurvenue(a.getAgeSurvenue())
                        .build())
                .collect(Collectors.toList());
    }

    /* ════════════════════════════════════════════════════════════════
       Rendez-vous (à venir uniquement)
    ════════════════════════════════════════════════════════════════ */
    private List<RendezVousDTO> mapRendezVous(UUID patientId) {
        return rendezVousRepository
                .findByPatientIdAndDateAfterOrderByDateAsc(patientId, LocalDateTime.now())
                .stream()
                .map(rdv -> RendezVousDTO.builder()
                        .id(rdv.getId())
                        .date(rdv.getDate())
                        .motif(rdv.getMotif())
                        .statut(rdv.getStatut().name())
                        .lieu(rdv.getLieu())
                        .medecinNom(rdv.getMedecin().getPrenom() + " " + rdv.getMedecin().getNom())
                        .build())
                .collect(Collectors.toList());
    }

    /* ════════════════════════════════════════════════════════════════
       Examens — résumé pour la grille
       Types supportés : ExamenManuel, Mammographie, Echographie, IRM, Biopsie
    ════════════════════════════════════════════════════════════════ */
    private List<ExamenSummaryDTO> mapExamens(DossierMedical dossier) {
        if (dossier.getExamens() == null) return List.of();

        return dossier.getExamens().stream()
                .sorted(Comparator.comparing(Examen::getDate).reversed())
                .map(this::mapOneExamen)
                .collect(Collectors.toList());
    }

    private ExamenSummaryDTO mapOneExamen(Examen examen) {
        String typeLabel;
        String imageUrl    = null;
        String resultat    = null;

        if (examen instanceof ExamenManuel em) {
            typeLabel = "MANUEL";
            resultat  = buildResultatManuel(em);

        } else if (examen instanceof Mammographie mammo) {
            typeLabel = "MAMMOGRAPHIE";
            imageUrl  = buildFileUrl(mammo.getImageRadio());
            resultat  = mammo.getScoreBIRADS() != null ? "BIRADS " + mammo.getScoreBIRADS().name() : null;

        } else if (examen instanceof Echographie echo) {
            typeLabel = "ECHOGRAPHIE";
            imageUrl  = buildFileUrl(echo.getImageRadio());
            resultat  = buildResultatEchographie(echo);

        } else if (examen instanceof IRM irm) {
            typeLabel = "IRM";
            imageUrl  = buildFileUrl(irm.getFichierImage());
            resultat  = irm.getScoreBIRADS() != null ? "BIRADS " + irm.getScoreBIRADS().name() : null;

        } else if (examen instanceof Biopsie biopsie) {
            typeLabel = "BIOPSIE";
            // première image analysée
            if (biopsie.getImagesAnalysees() != null && !biopsie.getImagesAnalysees().isEmpty()) {
                imageUrl = buildFileUrl(biopsie.getImagesAnalysees().get(0).getCheminImage());
            }
            resultat = buildResultatBiopsie(biopsie);

        } else {
            typeLabel = "AUTRE";
        }

        return ExamenSummaryDTO.builder()
                .id(examen.getId())
                .typeExamen(typeLabel)
                .date(examen.getDate())
                .siteAnatomique(examen.getSiteAnatomique())
                .visiblePatient(examen.getVisiblePatient())
                .imageUrl(imageUrl)
                .resultatResume(resultat)
                .build();
    }

    private String buildResultatManuel(ExamenManuel em) {
        StringBuilder sb = new StringBuilder();
        if (Boolean.TRUE.equals(em.getMassePalpee())) sb.append("Masse palpable");
        if (em.getLocalisationDeMasse() != null)      sb.append(" ").append(em.getLocalisationDeMasse());
        if (em.getAspectPeau() != null)               sb.append(" • Peau: ").append(em.getAspectPeau());
        return sb.length() > 0 ? sb.toString().trim() : null;
    }

    private String buildResultatEchographie(Echographie echo) {
        List<String> parts = new ArrayList<>();
        if (echo.getTypeStructure() != null) parts.add(echo.getTypeStructure());
        if (echo.getScoreBIRADS()   != null) parts.add("BIRADS " + echo.getScoreBIRADS().name());
        return parts.isEmpty() ? null : String.join(" • ", parts);
    }

    private String buildResultatBiopsie(Biopsie b) {
        if (b.getClasseBinaire() != null) {
            String res = b.getClasseBinaire();
            if (b.getTypeTumeur() != null) res += " — " + b.getTypeTumeur();
            return res;
        }
        return null;
    }

    /* ════════════════════════════════════════════════════════════════
       Timeline dynamique
       Sources : PlanTraitement  +  Examens (Manuel, Mammo, Echo, IRM, Biopsie)
       Triés par date ASC
    ════════════════════════════════════════════════════════════════ */
    private List<TimelineEventDTO> buildTimeline(DossierMedical dossier) {
        LocalDate today = LocalDate.now();
        List<TimelineEventDTO> events = new ArrayList<>();

        // ── Plans de traitement ──────────────────────────────────────
        if (dossier.getPlansTraitement() != null) {
            dossier.getPlansTraitement().forEach(plan -> events.add(
                    TimelineEventDTO.builder()
                            .id(plan.getId())
                            .type("PLAN_TRAITEMENT")
                            .date(plan.getDateConsultation())
                            .titre("Consultation")
                            .description(plan.getPrescription())
                            .completed(!plan.getDateConsultation().isAfter(today))
                            .build()
            ));
        }

        // ── Examens ─────────────────────────────────────────────────
        if (dossier.getExamens() != null) {
            dossier.getExamens().forEach(examen -> {
                LocalDate dateExamen = examen.getDate().toLocalDate();
                String type;
                String titre;

                if      (examen instanceof ExamenManuel)  { type = "EXAMEN_MANUEL";  titre = "Examen Manuel";  }
                else if (examen instanceof Mammographie)  { type = "MAMMOGRAPHIE";   titre = "Mammographie";   }
                else if (examen instanceof Echographie)   { type = "ECHOGRAPHIE";    titre = "Échographie";    }
                else if (examen instanceof IRM)           { type = "IRM";            titre = "IRM Mammaire";   }
                else if (examen instanceof Biopsie)       { type = "BIOPSIE";        titre = "Biopsie";        }
                else return; // ignorer les autres types

                events.add(TimelineEventDTO.builder()
                        .id(examen.getId())
                        .type(type)
                        .date(dateExamen)
                        .titre(titre)
                        .description(examen.getSiteAnatomique())
                        .completed(!dateExamen.isAfter(today))
                        .build());
            });
        }

        // Tri chronologique
        events.sort(Comparator.comparing(TimelineEventDTO::getDate));
        return events;
    }

    /* ════════════════════════════════════════════════════════════════
       Utilitaires
    ════════════════════════════════════════════════════════════════ */
    private String buildFileUrl(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) return null;
        if (relativePath.startsWith("http")) return relativePath;
        return baseUrl + "/uploads/" + relativePath;
    }
}