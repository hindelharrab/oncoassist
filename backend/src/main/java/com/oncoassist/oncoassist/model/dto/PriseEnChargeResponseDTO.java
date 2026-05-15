package com.oncoassist.oncoassist.model.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PriseEnChargeResponseDTO {
    private UUID id;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String role;
    private Boolean accesEcriture;

    // ✅ Infos du médecin exposées
    private UUID medecinId;
    private String medecinNom;
    private String medecinPrenom;
    private String medecinSpecialite;
}