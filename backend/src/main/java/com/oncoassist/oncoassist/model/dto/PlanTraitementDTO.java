package com.oncoassist.oncoassist.model.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data @Builder
public class PlanTraitementDTO {
    private UUID id;
    private LocalDate dateConsultation;
    private String prescription;
    private String examensComplementaires;
    private String recommandations;
    private Boolean visiblePatient;
    private String auteurNom;
    private String auteurPrenom;
}

