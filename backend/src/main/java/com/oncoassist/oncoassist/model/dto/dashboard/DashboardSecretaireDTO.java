package com.oncoassist.oncoassist.model.dto.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardSecretaireDTO {

    // ── Stats cards ────────────────────────────────
    private long totalPatients;
    private long rdvAujourdhui;
    private long rdvEnAttente;
    private long notificationsNonLues;

    // ── Performance rings ──────────────────────────
    private int pctRdvConfirmes;    // % RDV confirmés
    private int pctDossiersActifs;  // % dossiers actifs
    private int pctMedecinsActifs;  // % médecins actifs
    private int pctNotifsTraitees;  // % notifs lues

    // ── Sous-titres cards ──────────────────────────
    private long patientsNouveauMois;
    private long rdvEnCours;
    private long totalMedecins;
    private long medecinsActifs;
}