package com.oncoassist.oncoassist.model.dto;

import com.oncoassist.oncoassist.model.entity.enums.StatutClinique;
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
    private String photoProfil;
    private String role;
    private UUID dossierMedicalId;

    // Champs calculés
    private int age;
    private StatutClinique statut;
    private String medecinRef;
    private UUID medecinId;              // ← AJOUT
    private String derniereConsultation;
    private int nombreExamens;
}