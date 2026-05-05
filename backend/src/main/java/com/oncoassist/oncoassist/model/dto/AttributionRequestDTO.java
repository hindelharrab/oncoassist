package com.oncoassist.oncoassist.model.dto;

import com.oncoassist.oncoassist.model.entity.enums.FrequenceEnum;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class AttributionRequestDTO {
    private UUID patientId;
    private UUID medecinId;
    private FrequenceEnum frequence;
    private LocalDate dateFin;
}