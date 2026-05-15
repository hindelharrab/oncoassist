package com.oncoassist.oncoassist.model.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class VueEnsembleResponse {

    private PatientSummaryDTO patient;
    private List<AntecedentMedicalDTO> antecedentsMedicaux;
    private List<AntecedentFamilialDTO> antecedentsFamiliaux;
    private List<RendezVousDTO> rendezVous;
    private List<ExamenSummaryDTO> examens;
    private List<TimelineEventDTO> timeline;

    // ── Patient ────────────────────────────────────────────────────
    @Data @Builder
    public static class PatientSummaryDTO {
        private UUID id;
        private String nom;
        private String prenom;
        private int age;
        private String telephone;
        private String photoProfil;
        private String statut;                    // ACTIF, ARCHIVE...
        private List<MedecinSummaryDTO> medecins; // équipe référente
    }

    @Data @Builder
    public static class MedecinSummaryDTO {
        private UUID id;
        private String nom;
        private String prenom;
        private String specialite;
        private String photoProfil;
    }

    // ── Antécédents ────────────────────────────────────────────────
    @Data @Builder
    public static class AntecedentMedicalDTO {
        private UUID id;
        private String maladie;
        private LocalDate dateDiagnostic;
        private String statut;
        private String traitements;
    }

    @Data @Builder
    public static class AntecedentFamilialDTO {
        private UUID id;
        private String lienFamilial;
        private String maladie;
        private String ageSurvenue;
    }

    // ── Rendez-vous ────────────────────────────────────────────────
    @Data @Builder
    public static class RendezVousDTO {
        private UUID id;
        private LocalDateTime date;
        private String motif;
        private String statut;
        private String lieu;
        private String medecinNom;
    }

    // ── Examens (résumé pour la grille) ───────────────────────────
    @Data @Builder
    public static class ExamenSummaryDTO {
        private UUID id;
        private String typeExamen;        // MANUEL | MAMMOGRAPHIE | ECHOGRAPHIE | IRM | BIOPSIE
        private LocalDateTime date;
        private String siteAnatomique;
        private Boolean visiblePatient;
        private String imageUrl;          // première image disponible (null si aucune)
        private String resultatResume;    // résumé court du résultat
    }

    // ── Timeline (basée sur PlanTraitement) ───────────────────────
    @Data @Builder
    public static class TimelineEventDTO {
        private UUID id;
        private String type;              // PLAN_TRAITEMENT | EXAMEN_MANUEL | MAMMOGRAPHIE | ECHOGRAPHIE | IRM | BIOPSIE
        private LocalDate date;
        private String titre;
        private String description;
        private boolean completed;        // date passée → true
    }
}