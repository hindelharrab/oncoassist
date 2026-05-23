package com.oncoassist.oncoassist.model.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminProfileDTO {
    private UUID   id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String photoProfil;
    // Stats
    private long   totalRdv;
    private long   totalMembres; // médecins + secrétaires
    private long   totalPatients;
    private long   totalMedecins;
    private long   totalSecretaires;
}