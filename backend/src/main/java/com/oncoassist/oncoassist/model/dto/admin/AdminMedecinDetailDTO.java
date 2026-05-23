package com.oncoassist.oncoassist.model.dto.admin;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class AdminMedecinDetailDTO {

    private UUID   id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String photoProfil;
    private String numeroOrdre;
    private UUID   specialiteId;
    private String specialiteNom;
    private String statut;

    // Stats
    private int nbPatients;
    private int rdvAujourdhui;
    private int totalRdv;
    private int rdvEffectues;
    private int rdvAnnules;

    // Disponibilités par jour (remplace joursDisponibles + heureDebut/heureFin)
    private List<DisponibiliteDTO> disponibilites;

    // Documents
    private List<DocumentSummary> documents;

    // Derniers RDV
    private List<AdminRdvSummary> derniersRdv;

    // ── Sous-DTOs ────────────────────────────────────────────
    @Data
    public static class DisponibiliteDTO {
        private UUID   id;
        private String jour;       // "MONDAY"
        private String heureDebut; // "09:00"
        private String heureFin;   // "17:00"
    }

    @Data
    public static class DocumentSummary {
        private UUID      id;
        private String    nom;
        private String    typeDocument;
        private String    tailleFichier;
        private LocalDate dateAjout;
        private String    cheminFichier;
    }

    @Data
    public static class AdminRdvSummary {
        private UUID   id;
        private String date;
        private String motif;
        private String statut;
        private String patientNom;
        private String patientPrenom;
        private String lieu;
    }
}