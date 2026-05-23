package com.oncoassist.oncoassist.model.dto.admin;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardStatsDTO {

    // ── Carte 1 : RDV du jour ─────────────────────────────
    private long    rdvDuJour;
    private String  rdvChange;
    private List<Long> rdvSpark;          // 7 derniers jours
    private long    rdvEffectues;
    private long    rdvEnAttente;
    private long    rdvAnnules;
    private int     rdvTauxCompletion;    // %
    private long    rdvSemaine;
    private long    rdvMois;
    private long    rdvAnnulesMois;

    // ── Carte 2 : Médecins ────────────────────────────────
    private long    medecinsActifs;
    private String  medecinsChange;
    private List<Long> medecinsSpark;
    private long    medecinsGeneralistes;
    private long    medecinsSpecialistes;
    private long    medecinsRemplacants;  // statique ou à implémenter plus tard
    private int     medecinsDisponibilite; // % (calculé via RDV)
    private double  consultationsParJour;
    private long    medecinsNouveaux;     // créés ce mois
    private long    medecinsIndisponibles;
    private Map<String, Long> medecinsBySpecialite; // Radar chart

    // ── Carte 3 : Patients ────────────────────────────────
    private long    patientsTotal;
    private String  patientsChange;
    private List<Long> patientsSpark;
    private long    patientsActifs;
    private long    patientsArchives;
    private long    patientsNouveauxMois;
    private int     patientsTauxRetention; // %
    private long    patientsAdultes;
    private long    patientsEnfants;
    private long    patientsSeniors;
    private List<Long> patientsNouveauxParSemaine; // 7 semaines

    // ── Carte 4 : Dossiers (remplace Satisfaction) ────────
    private long    dossiersActifs;
    private String  dossiersChange;
    private List<Long> dossiersSpark;
    private long    dossiersEnCours;
    private long    dossiersArchives;
    private long    dossiersCreésMois;
    private int     dossiersCompletion;   // % dossiers complets
    private long    dossiersCeMois;
    private long    dossiersTrimestre;
    private long    dossiersAvecExamen;
}