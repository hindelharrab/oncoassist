package com.oncoassist.oncoassist.model.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RdvMensuelDTO {
    private String mois;
    private long   effectues;
    private long   attente;
}