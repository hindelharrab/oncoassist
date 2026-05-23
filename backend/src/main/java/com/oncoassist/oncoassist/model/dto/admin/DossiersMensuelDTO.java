package com.oncoassist.oncoassist.model.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DossiersMensuelDTO {
    private String mois;
    private long   actifs;
    private long   archives;
}