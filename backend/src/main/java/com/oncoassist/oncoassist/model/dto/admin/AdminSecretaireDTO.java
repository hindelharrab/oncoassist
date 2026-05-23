package com.oncoassist.oncoassist.model.dto.admin;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class AdminSecretaireDTO {

    private UUID   id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String photoProfil;
    private String role;

    private UUID   specialiteId;
    private String specialiteNom;

    private long totalRendezVousGeres;
    private long rdvPlanifies;   // ✅ PLANIFIE
    private long rdvEffectues;   // ✅ EFFECTUE
    private long rdvAnnules;     // ✅ ANNULE
    private long rdvEnAttente;   // ✅ EN_ATTENTE

    private List<ActiviteDTO> activitesRecentes;

    @Data
    @Builder
    public static class ActiviteDTO {
        private String date;
        private String heure;
        private String action;
        private String typeAction;
        private String patientNom;
        private String patientPrenom;
        private UUID   rendezVousId;
    }
}