package com.oncoassist.oncoassist.model.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PatientDetailDTO {
    private UUID id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private LocalDate dateNaissance;
    private String adresse;
    private String personneConfiance;
    private UUID dossierMedicalId; // ← clé du problème
}