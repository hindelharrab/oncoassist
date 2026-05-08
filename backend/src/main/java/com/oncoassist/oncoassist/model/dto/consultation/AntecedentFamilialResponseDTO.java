package com.oncoassist.oncoassist.model.dto.consultation;

import com.oncoassist.oncoassist.model.entity.enums.LienFamilialEnum;
import lombok.Data;
import java.util.UUID;

@Data
public class AntecedentFamilialResponseDTO {
    private UUID id;
    private LienFamilialEnum lienFamilial;
    private String maladie;
    private Integer ageSurvenue;
}