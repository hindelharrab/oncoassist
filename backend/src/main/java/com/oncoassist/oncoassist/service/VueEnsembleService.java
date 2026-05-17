package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.VueEnsembleDTO;
import com.oncoassist.oncoassist.model.entity.*;
import com.oncoassist.oncoassist.model.entity.enums.StatutRDVEnum;
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

@Service
@RequiredArgsConstructor
public class VueEnsembleService {

    private final PatientRepository         patientRepository;
    private final DossierMedicalRepository  dossierMedicalRepository;
    private final PriseEnChargeRepository   priseEnChargeRepository;
    private final RendezVousRepository      rendezVousRepository;
    private final PlanTraitementRepository  planTraitementRepository;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    /* ─────────────────────────────────────────────────────────── */

    @Transactional(readOnly = true)
    public VueEnsembleDTO buildVueEnsemble(UUID patientId) {

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient introuvable : " + patientId));

        DossierMedical dossier = dossierMedicalRepository.findByPatientId(patientId)
                .orElseThrow(() -> new RuntimeException("Dossier médical introuvable : " + patientId));

        VueEnsembleDTO dto = new VueEnsembleDTO();
        dto.setPatient(buildPatientInfo(patient, dossier));
        dto.setAntecedentsMedicaux(buildAntecedentsMedicaux(dossier));
        dto.setAntecedentsFamiliaux(buildAntecedentsFamiliaux(dossier));
        dto.setExamens(buildExamens(dossier));
        dto.setProchainRendezVous(buildProchainRdv(patient));
        dto.setPlansTraitement(buildPlansTraitement(dossier));

        return dto;
    }

    /* ── Patient Info ──────────────────────────────────────────── */

    private VueEnsembleDTO.PatientInfoDTO buildPatientInfo(Patient patient, DossierMedical dossier) {
        VueEnsembleDTO.PatientInfoDTO info = new VueEnsembleDTO.PatientInfoDTO();
        info.setId(patient.getId());
        info.setNom(patient.getNom());
        info.setPrenom(patient.getPrenom());
        if (patient.getPhotoProfil() != null && !patient.getPhotoProfil().isBlank()) {
            String raw = patient.getPhotoProfil();
            // Extrait uniquement le nom de fichier (ex: "279028b0.png")
            String fileName = raw.contains("/")
                    ? raw.substring(raw.lastIndexOf('/') + 1)
                    : raw;
            info.setPhotoProfil(baseUrl + "/uploads/" + fileName);
        }

        if (patient.getDateNaissance() != null) {
            info.setAge(Period.between(patient.getDateNaissance(), LocalDate.now()).getYears());
        }

        info.setDossierId("D-" + dossier.getId().toString().substring(0, 4).toUpperCase() + "-X");

        List<PriseEnCharge> prises = priseEnChargeRepository.findByPatientId(patient.getId());
        List<VueEnsembleDTO.MedecinRefDTO> equipe = prises.stream()
                .map(pec -> {
                    VueEnsembleDTO.MedecinRefDTO m = new VueEnsembleDTO.MedecinRefDTO();
                    m.setNom(pec.getMedecin().getNom());
                    m.setPrenom(pec.getMedecin().getPrenom());
                    m.setSpecialite(pec.getMedecin().getSpecialite() != null
                            ? pec.getMedecin().getSpecialite().getNom()
                            : "Médecin");
                    return m;
                })
                .collect(Collectors.toList());
        info.setEquipe(equipe);
        System.out.println(">>> photoProfil raw = " + patient.getPhotoProfil());
        System.out.println(">>> photoProfil url = " + info.getPhotoProfil());
        return info;
    }

    /* ── Antécédents Médicaux ──────────────────────────────────── */

    private List<VueEnsembleDTO.AntecedentMedicalDTO> buildAntecedentsMedicaux(DossierMedical dossier) {
        if (dossier.getAntecedentsMedicaux() == null) return Collections.emptyList();

        return dossier.getAntecedentsMedicaux().stream()
                .map(a -> {
                    VueEnsembleDTO.AntecedentMedicalDTO d = new VueEnsembleDTO.AntecedentMedicalDTO();
                    d.setId(a.getId());
                    d.setMaladie(a.getMaladie());
                    d.setDateDiagnostic(a.getDateDiagnostic());
                    d.setStatut(a.getStatut() != null ? a.getStatut().name() : null);
                    d.setTraitements(a.getTraitements());
                    return d;
                })
                .collect(Collectors.toList());
    }

    /* ── Antécédents Familiaux ─────────────────────────────────── */

    private List<VueEnsembleDTO.AntecedentFamilialDTO> buildAntecedentsFamiliaux(DossierMedical dossier) {
        if (dossier.getAntecedentsFamiliaux() == null) return Collections.emptyList();

        return dossier.getAntecedentsFamiliaux().stream()
                .map(a -> {
                    VueEnsembleDTO.AntecedentFamilialDTO d = new VueEnsembleDTO.AntecedentFamilialDTO();
                    d.setId(a.getId());
                    d.setLienFamilial(a.getLienFamilial() != null ? a.getLienFamilial().name() : null);
                    d.setMaladie(a.getMaladie());
                    d.setAgeSurvenue(a.getAgeSurvenue());
                    return d;
                })
                .collect(Collectors.toList());
    }

    /* ── Examens ───────────────────────────────────────────────── */
    // Ordre fixe : ExamenManuel → Mammographie → Echographie → IRM → Biopsie

    private static final List<String> EXAM_ORDER =
            List.of("ExamenManuel", "Mammographie", "Echographie", "IRM", "Biopsie");

    private List<VueEnsembleDTO.ExamenCardDTO> buildExamens(DossierMedical dossier) {
        if (dossier.getExamens() == null) return Collections.emptyList();

        return dossier.getExamens().stream()
                .sorted(Comparator.comparingInt(e -> {
                    int idx = EXAM_ORDER.indexOf(e.getClass().getSimpleName());
                    return idx == -1 ? 99 : idx;
                }))
                .map(this::toExamenCard)
                .collect(Collectors.toList());
    }

    private VueEnsembleDTO.ExamenCardDTO toExamenCard(Examen examen) {
        VueEnsembleDTO.ExamenCardDTO card = new VueEnsembleDTO.ExamenCardDTO();
        card.setId(examen.getId());
        card.setDate(examen.getDate());
        card.setSiteAnatomique(examen.getSiteAnatomique());

        if (examen instanceof ExamenManuel em) {
            card.setTypeExamen("MANUEL");
            card.setImageUrl(null);
            card.setResultatResume(buildManuelResume(em));

        } else if (examen instanceof Mammographie mammo) {
            card.setTypeExamen("MAMMOGRAPHIE");
            card.setImageUrl(buildImageUrl(mammo.getImageRadio()));
            card.setResultatResume(mammo.getScoreBIRADS() != null
                    ? "Score BIRADS : " + mammo.getScoreBIRADS().name()
                    : "Résultat en attente");

        } else if (examen instanceof Echographie echo) {
            card.setTypeExamen("ECHOGRAPHIE");
            card.setImageUrl(buildImageUrl(echo.getImageRadio()));
            StringBuilder r = new StringBuilder();
            if (echo.getScoreBIRADS()   != null) r.append("BIRADS : ").append(echo.getScoreBIRADS().name());
            if (echo.getTypeStructure() != null && !echo.getTypeStructure().isBlank())
                r.append(r.length() > 0 ? " — " : "").append(echo.getTypeStructure());
            card.setResultatResume(r.length() > 0 ? r.toString() : "Résultat en attente");

        } else if (examen instanceof IRM irm) {
            card.setTypeExamen("IRM");
            card.setImageUrl(buildImageUrl(irm.getFichierImage()));
            StringBuilder r = new StringBuilder();
            if (irm.getScoreBIRADS()    != null) r.append("BIRADS : ").append(irm.getScoreBIRADS().name());
            if (irm.getRecommandation() != null && !irm.getRecommandation().isBlank())
                r.append(r.length() > 0 ? " — " : "").append(irm.getRecommandation());
            card.setResultatResume(r.length() > 0 ? r.toString() : "Résultat en attente");

        } else if (examen instanceof Biopsie biopsie) {
            card.setTypeExamen("BIOPSIE");
            if (biopsie.getImagesAnalysees() != null && !biopsie.getImagesAnalysees().isEmpty()) {
                card.setImageUrl(buildImageUrl(
                        biopsie.getImagesAnalysees().get(0).getCheminImage()));
            }
            card.setResultatResume(buildBiopsieResume(biopsie));
        }

        return card;
    }

    private String buildManuelResume(ExamenManuel em) {
        StringBuilder sb = new StringBuilder();
        if (Boolean.TRUE.equals(em.getMassePalpee())) {
            sb.append("Masse palpée");
            if (em.getLocalisationDeMasse() != null)
                sb.append(" — ").append(em.getLocalisationDeMasse());
        }
        if (em.getAspectPeau()   != null) sb.append(sb.length() > 0 ? " | " : "").append("Peau : ").append(em.getAspectPeau());
        if (em.getAdenopathies() != null) sb.append(sb.length() > 0 ? " | " : "").append("Adénopathies : ").append(em.getAdenopathies());
        if (em.getDescription()  != null && !em.getDescription().isBlank())
            sb.append(sb.length() > 0 ? " | " : "").append(em.getDescription());
        return sb.length() > 0 ? sb.toString() : "Examen clinique réalisé";
    }

    private String buildBiopsieResume(Biopsie b) {
        StringBuilder sb = new StringBuilder();
        if (b.getClasseBinaire()   != null) sb.append(b.getClasseBinaire());
        if (b.getTypeTumeur()      != null) sb.append(sb.length() > 0 ? " — " : "").append(b.getTypeTumeur());
        if (b.getScoreBenignMalin() != null) sb.append(String.format(" (%.0f%%)", b.getScoreBenignMalin() * 100));
        return sb.length() > 0 ? sb.toString() : "Analyse en cours";
    }

    private String buildImageUrl(String path) {
        if (path == null || path.isBlank()) return null;
        if (path.startsWith("http")) return path;
        // Si le chemin commence déjà par "uploads/" → ne pas re-ajouter
        if (path.startsWith("uploads/")) return baseUrl + "/" + path;
        // Sinon juste un nom de fichier
        return baseUrl + "/uploads/photos/" + path;
    }

    /* ── Prochain Rendez-vous ──────────────────────────────────── */

    private VueEnsembleDTO.RendezVousDTO buildProchainRdv(Patient patient) {
        LocalDateTime now          = LocalDateTime.now();
        LocalDateTime startOfToday = now.toLocalDate().atStartOfDay();

        return rendezVousRepository
                .findRdvByPatientAndStatut(patient.getId(), StatutRDVEnum.EN_ATTENTE)
                .stream()
                .filter(rdv -> rdv.getDate() != null && !rdv.getDate().isBefore(startOfToday))
                .findFirst()
                .map(rdv -> {
                    VueEnsembleDTO.RendezVousDTO d = new VueEnsembleDTO.RendezVousDTO();
                    d.setId(rdv.getId());
                    d.setDate(rdv.getDate());
                    d.setMotif(rdv.getMotif());
                    d.setStatut(rdv.getStatut().name());
                    d.setLieu(rdv.getLieu());
                    d.setAujourdhui(rdv.getDate().toLocalDate().isEqual(now.toLocalDate()));
                    return d;
                })
                .orElse(null);
    }

    /* ── Plans Traitement (Timeline) ──────────────────────────── */
    /*
     * Champs utilisés depuis la nouvelle entité PlanTraitement :
     *   - dateConsultation  (LocalDate)
     *   - etape             (String) : "Examen manuel", "IRM", "Biopsie"…
     *   - statut            (String) : "fait" | "à venir"
     *   - prochaineEtape    (String) : texte libre
     *   - visiblePatient    (Boolean)
     *
     * Supprimés (ancienne version) : prescription, examensComplementaires, recommandations
     */

    private List<VueEnsembleDTO.PlanTraitementTimelineDTO> buildPlansTraitement(DossierMedical dossier) {
        return planTraitementRepository
                .findByDossierMedicalIdOrderByDateConsultationAsc(dossier.getId())
                .stream()
                .map(p -> {
                    VueEnsembleDTO.PlanTraitementTimelineDTO d = new VueEnsembleDTO.PlanTraitementTimelineDTO();
                    d.setId(p.getId());
                    d.setDateConsultation(p.getDateConsultation());
                    d.setEtape(p.getEtape());
                    d.setStatut(p.getStatut());
                    d.setProchaineEtape(p.getProchaineEtape());
                    d.setVisiblePatient(p.getVisiblePatient());
                    return d;
                })
                .collect(Collectors.toList());
    }
}