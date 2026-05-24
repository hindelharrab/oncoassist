package com.oncoassist.oncoassist.model.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class PlanningOverviewDTO {
    private List<PlanningMedecinDTO> medecins;
    private List<PlanningRdvDTO>     rdvs;
    private long                     totalConfirmes;
    private long                     totalEnAttente;
    private long                     totalUrgents;
    private long                     totalAnnules;
}