package com.oncoassist.oncoassist.model.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MedecinPerformanceDTO {
    private String id;
    private String nom;
    private String prenom;
    private String specialite;
    private long   patients;
    private long   rdvMois;
    private int    growth;   // % RDV vs mois précédent
}