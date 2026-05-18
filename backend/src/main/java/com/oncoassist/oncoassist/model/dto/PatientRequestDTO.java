package com.oncoassist.oncoassist.model.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PatientRequestDTO {
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String adresse;
    private LocalDate dateNaissance;
    private String personneConfiance;
    private String motDePasse;

    // Médecin référent — envoyé par la secrétaire
    private UUID medecinId;
}