package com.oncoassist.oncoassist.model.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class MedecinResponseDTO {
    private UUID   id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String photoProfil;
    private String numeroOrdre;
    private String specialiteNom;

    // Champs enrichis
    private int nbPatients;
    private int rdvAujourdhui;
}