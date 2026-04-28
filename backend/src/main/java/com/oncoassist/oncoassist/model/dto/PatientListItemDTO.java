package com.oncoassist.oncoassist.model.dto;

import com.oncoassist.oncoassist.model.entity.enums.StatutClinique;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PatientListItemDTO {
    private UUID id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String adresse;
    private String personneConfiance;
    private LocalDate dateNaissance;
    private Integer age;

    // Champs calculés
    private StatutClinique statut;
    private String dernierBIRADS;
    private Integer nombreExamens;
    private Boolean suiviActif;
}