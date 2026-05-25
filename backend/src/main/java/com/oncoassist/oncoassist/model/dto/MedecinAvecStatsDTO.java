package com.oncoassist.oncoassist.model.dto;

import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MedecinAvecStatsDTO {
    private UUID   id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String photoProfil;
    private String numeroOrdre;
    private String specialiteNom;
    private long   nbPatients;
    private long   rdvAujourdhui;
}