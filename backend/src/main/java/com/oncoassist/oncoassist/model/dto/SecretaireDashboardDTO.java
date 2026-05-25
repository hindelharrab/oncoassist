package com.oncoassist.oncoassist.model.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SecretaireDashboardDTO {

    // ── Stats cards ──
    private long totalPatients;
    private long rdvAujourdhui;
    private long rdvEnAttente;
    private long rdvPlanifiesSemaine;

    // ── Flux journalier ──
    private List<RdvJourDTO> rdvDuJour;

    // ── Médecins ──
    private List<MedecinStatutDTO> medecins;

    // ── Activité mensuelle ──
    private List<Integer> rdvParMois;
    private List<Integer> patientsParMois;

    // ── Performance ──
    private int tauxRdvConfirmes;
    private int tauxPatientsTraites;
    private int tauxMedecinsActifs;
    private int tauxNotifsTraitees;

    /* ── Sous-classes ── */

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RdvJourDTO {
        private String id;
        private String heure;
        private String patient;
        private String medecin;
        private String motif;
        private String lieu;
        private String statut;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MedecinStatutDTO {
        private String id;
        private String nom;
        private String prenom;
        private String initiales;
        private String statut;          // "En Consultation" | "Disponible" | "Absent"
        private long   nbRdvAujourdhui;
        private long   nbPatients;      // patients distincts tous RDV confondus
    }
}