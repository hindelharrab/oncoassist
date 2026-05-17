package com.oncoassist.oncoassist.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PatientRequestDTO {

    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String adresse;
    private LocalDate dateNaissance;
    private String personneConfiance;

    @JsonProperty("mot_de_passe")
    private String motDePasse;
}