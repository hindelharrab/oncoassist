package com.oncoassist.oncoassist.model.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class VueEnsembleDTO {

    private PatientInfoDTO patient;
    private List<AntecedentMedicalDTO> antecedentsMedicaux;
    private List<AntecedentFamilialDTO> antecedentsFamiliaux;
    private List<ExamenCardDTO> examens;
    private RendezVousDTO prochainRendezVous;
    private List<PlanTraitementTimelineDTO> plansTraitement;

    /* ── Patient ── */
    @Data
    public static class PatientInfoDTO {
        private UUID id;
        private String nom;
        private String prenom;
        private Integer age;
        private String dossierId;
        private String photoProfil;
        private List<MedecinRefDTO> equipe;
    }

    @Data
    public static class MedecinRefDTO {
        private String nom;
        private String prenom;
        private String specialite;
    }

    /* ── Antécédents Médicaux ── */
    @Data
    public static class AntecedentMedicalDTO {
        private UUID id;
        private String maladie;
        private LocalDate dateDiagnostic;
        private String statut;
        private String traitements;
    }

    /* ── Antécédents Familiaux ── */
    @Data
    public static class AntecedentFamilialDTO {
        private UUID id;
        private String lienFamilial;
        private String maladie;
        private String ageSurvenue;
    }

    /* ── Examen Card ── */
    @Data
    public static class ExamenCardDTO {
        private UUID id;
        private String typeExamen;       // MANUEL | MAMMOGRAPHIE | ECHOGRAPHIE | IRM | BIOPSIE
        private LocalDateTime date;
        private String siteAnatomique;
        private String imageUrl;         // null pour examen manuel
        private String resultatResume;
    }

    /* ── Rendez-vous ── */
    @Data
    public static class RendezVousDTO {
        private UUID id;
        private LocalDateTime date;
        private String motif;
        private String statut;
        private String lieu;
        private boolean aujourdhui;
    }

    /* ── Plan Traitement Timeline ── */
    @Data
    public static class PlanTraitementTimelineDTO {
        private UUID id;
        private LocalDate dateConsultation;

        // "Examen manuel", "IRM", "Échographie", "Biopsie"…
        private String etape;

        // "fait" | "à venir"
        private String statut;

        // Prochaine étape prévue (texte libre)
        private String prochaineEtape;

        // Visible par le patient
        private Boolean visiblePatient;
    }
}