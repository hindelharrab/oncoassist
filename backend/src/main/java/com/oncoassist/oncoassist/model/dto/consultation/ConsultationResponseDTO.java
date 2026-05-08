package com.oncoassist.oncoassist.model.dto.consultation;

import lombok.Data;
import java.util.List;

@Data
public class ConsultationResponseDTO {
    private ExamenManuelResponseDTO examenManuel;
    private List<AntecedentMedicalResponseDTO> antecedentsMedicaux;
    private List<AntecedentFamilialResponseDTO> antecedentsFamiliaux;
}