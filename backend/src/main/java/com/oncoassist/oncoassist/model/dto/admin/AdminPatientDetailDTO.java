package com.oncoassist.oncoassist.model.dto.admin;

import com.oncoassist.oncoassist.model.entity.enums.StatutClinique;
import com.oncoassist.oncoassist.model.entity.enums.StatutDossierEnum;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class AdminPatientDetailDTO {

    // ── Identité ─────────────────────────────────────────────
    private UUID   id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private LocalDate dateNaissance;
    private int    age;
    private String adresse;
    private String personneConfiance;
    private String photoProfil;

    // ── Dossier (statut administratif seulement) ─────────────
    private UUID             dossierMedicalId;
    private StatutDossierEnum statutDossier;      // ACTIF / ARCHIVE
    private LocalDate        dateCreationDossier;

    // ── Statut clinique global (calculé, sans détails médicaux) ─
    private StatutClinique statut;                // NOUVELLE / STABLE / etc.

    // ── Médecin référent ─────────────────────────────────────
    private UUID   medecinId;
    private String medecinRef;      // nom complet
    private String medecinEmail;
    private String medecinTelephone;
    private String medecinPhoto;

    // ── Rendez-vous (motif + statut seulement, pas les notes médicales) ──
    private int                    nombreRendezVous;
    private String                 derniereConsultation;   // date formatée
    private String                 prochainRendezVous;     // date formatée
    private List<AdminRdvSummary>  derniersRendezVous;     // 3 derniers max

    // ── Compteurs (sans contenu médical) ─────────────────────
    private int nombreExamens;     // juste le nombre
    private int nombreDocuments;   // juste le nombre

    // ── Sous-DTO RDV (sans données médicales) ────────────────
    @Data
    public static class AdminRdvSummary {
        private UUID   id;
        private String date;        // formatée "dd MMM yyyy HH:mm"
        private String motif;       // motif administratif
        private String statut;      // EN_ATTENTE / CONFIRME / EFFECTUE / ANNULE
        private String medecin;     // nom du médecin
        private String lieu;
        private String medecinPhoto;
    }
}
