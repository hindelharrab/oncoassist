package com.oncoassist.oncoassist.model.dto.consultation;

import com.oncoassist.oncoassist.model.entity.enums.StatutAntecEnum;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class AntecedentMedicalResponseDTO {
    private UUID id;
    private String maladie;
    private LocalDate dateDiagnostic;
    private StatutAntecEnum statut;
    private String traitements;
}