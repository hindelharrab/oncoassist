package com.oncoassist.oncoassist.model.dto;

import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SecretairePrintPatientDTO {
    private UUID    id;
    private String  nom;
    private String  prenom;
    private String  email;
    private String  telephone;
    private String  adresse;
    private String  dateNaissance;
    private Integer age;
    private String  statut;
    private String  photoProfil;
    private String  medecinRef;
    private UUID    dossierMedicalId;
    private boolean hasRapportFinal;
    private String  derniereConsultation;
}