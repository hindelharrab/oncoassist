package com.oncoassist.oncoassist.model.dto.consultation;

import com.oncoassist.oncoassist.model.entity.enums.LienFamilialEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AntecedentFamilialRequestDTO {
    @NotNull
    private LienFamilialEnum lienFamilial;
    @NotBlank
    private String maladie;
    private Integer ageSurvenue;
}