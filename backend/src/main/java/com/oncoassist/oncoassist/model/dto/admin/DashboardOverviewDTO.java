package com.oncoassist.oncoassist.model.dto.admin;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DashboardOverviewDTO {
    private DashboardStatsDTO          stats;
    private List<RdvMensuelDTO>        rdvMensuel;
    private List<PatientsMedecinDTO>   patientsByMedecin;
    private List<SpecialiteStatDTO>    specialites;
    private List<DossiersMensuelDTO>   dossiersMensuel;
    private List<MedecinPerformanceDTO> topMedecins;
    private List<SecretaireStatsDTO>   secretaires;
}