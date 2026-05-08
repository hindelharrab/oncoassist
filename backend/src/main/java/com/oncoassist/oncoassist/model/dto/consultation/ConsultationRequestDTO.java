package com.oncoassist.oncoassist.model.dto.consultation;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
public class ConsultationRequestDTO {
    @NotNull
    private UUID medecinId;
    @NotNull
    @Valid
    private ExamenManuelRequestDTO examenManuel;
    @Valid
    private List<AntecedentMedicalRequestDTO> antecedentsMedicaux = new ArrayList<>();
    @Valid
    private List<AntecedentFamilialRequestDTO> antecedentsFamiliaux = new ArrayList<>();
    private String notes; // stocké dans siteAnatomique ou un champ dédié — voir note ci-dessous
}
