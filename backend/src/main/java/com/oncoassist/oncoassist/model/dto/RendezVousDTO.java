package com.oncoassist.oncoassist.model.dto;

import com.oncoassist.oncoassist.model.entity.enums.StatutRDVEnum;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RendezVousDTO {

    private UUID          id;
    private String        motif;
    private StatutRDVEnum statut;
    private LocalDateTime date;
    private String        lieu;
    private LocalDateTime dateCreation;

    // Patient
    private String        patientNom;
    private String        patientPrenom;
    private UUID          patientId;

    // 🔥 AJOUTS POUR LE MÉDECIN
    private String        medecinNom;
    private String        medecinPrenom;
    private UUID          medecinId;
    private String        medecinSpecialite;

    // 🔥 AJOUTS POUR L'AFFICHAGE PLANNING
    private String        heure;
    private Integer       jourOffset;
    private String        jour;
    private Integer       duree;
}