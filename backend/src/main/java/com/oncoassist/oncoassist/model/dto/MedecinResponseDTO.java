package com.oncoassist.oncoassist.model.dto;

import lombok.*;

import java.util.UUID;


@Getter
@Setter @NoArgsConstructor @AllArgsConstructor
public class MedecinResponseDTO {
    private UUID id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String photoProfil;
    private String numeroOrdre;
    private String specialiteNom;


}