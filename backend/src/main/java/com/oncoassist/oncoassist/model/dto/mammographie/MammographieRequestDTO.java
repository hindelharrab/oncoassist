package com.oncoassist.oncoassist.model.dto.mammographie;

import lombok.Data;

@Data
public class MammographieRequestDTO {
    // ID du dossier médical de la patiente
    private Long dossierId;
    // Notes du médecin (optionnel)
    private String notes;
}