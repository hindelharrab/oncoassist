package com.oncoassist.oncoassist.model.dto;

import com.oncoassist.oncoassist.model.entity.enums.StatutAntecEnum;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data @Builder
public class AntecedentMedicalDTO {
    private UUID id;
    private String maladie;
    private LocalDate dateDiagnostic;
    private StatutAntecEnum statut;
    private String traitements;
}
