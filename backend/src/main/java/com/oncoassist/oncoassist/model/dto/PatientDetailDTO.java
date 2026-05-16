package com.oncoassist.oncoassist.model.dto;

import com.oncoassist.oncoassist.model.entity.PriseEnCharge;
import com.oncoassist.oncoassist.model.entity.RendezVous;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;
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

    // ✅ Le champ clé
    private UUID dossierMedicalId;

    // Relations existantes
    private List<PriseEnCharge> prisesEnCharge;
    private List<RendezVous> rendezVous;
    private List<Notification> notifications;
}