package com.oncoassist.oncoassist.model.dto;

import com.oncoassist.oncoassist.model.entity.enums.RolePECEnum;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data @Builder
public class PriseEnChargeDTO {
    private UUID id;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private RolePECEnum role;
    private String medecinNom;
    private String medecinPrenom;
    private String medecinSpecialite;
    private UUID medecinId;
}
