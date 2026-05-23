package com.oncoassist.oncoassist.model.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class PlanningRdvDTO {
    private UUID   id;
    private String motif;
    private String statut;
    private String date;        // ISO : "2024-05-20T09:00:00"
    private String lieu;
    private String patientNom;
    private String patientPrenom;
    private String patientPhoto;
    private String medecinNom;
    private String medecinPrenom;
    private String secretaireNom;
    private String secretairePrenom;
}