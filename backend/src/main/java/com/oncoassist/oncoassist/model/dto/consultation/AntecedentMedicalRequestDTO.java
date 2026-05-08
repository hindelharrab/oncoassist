package com.oncoassist.oncoassist.model.dto.consultation;

import com.oncoassist.oncoassist.model.entity.enums.StatutAntecEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class AntecedentMedicalRequestDTO {
    @NotBlank
    private String maladie;
    private LocalDate dateDiagnostic;
    @NotNull
    private StatutAntecEnum statut;
    private String traitements;
}