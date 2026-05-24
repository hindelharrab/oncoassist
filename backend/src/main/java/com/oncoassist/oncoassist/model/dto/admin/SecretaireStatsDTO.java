package com.oncoassist.oncoassist.model.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SecretaireStatsDTO {
    private String id;
    private String nom;
    private String prenom;
    private long   rdvGeres;
    private int    tauxCompletion; // % RDV effectués sur total gérés
    private String status;
}