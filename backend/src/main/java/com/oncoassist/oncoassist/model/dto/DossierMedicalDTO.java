package com.oncoassist.oncoassist.model.dto;

import com.oncoassist.oncoassist.model.entity.enums.StatutDossierEnum;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data @Builder
public class DossierMedicalDTO {
    private UUID id;
    private LocalDate dateCreation;
    private StatutDossierEnum statut;
    private UUID patientId;
}