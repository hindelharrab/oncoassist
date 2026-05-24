package com.oncoassist.oncoassist.model.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class PlanningMedecinDTO {
    private UUID   id;
    private String nom;
    private String prenom;
    private String specialite;
    private String photo;
}