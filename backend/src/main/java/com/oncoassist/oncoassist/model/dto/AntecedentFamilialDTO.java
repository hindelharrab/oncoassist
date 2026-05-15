package com.oncoassist.oncoassist.model.dto;

import com.oncoassist.oncoassist.model.entity.enums.LienFamilialEnum;
import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data @Builder
public class AntecedentFamilialDTO {
    private UUID id;
    private LienFamilialEnum lienFamilial;
    private String maladie;
    private String ageSurvenue;
}