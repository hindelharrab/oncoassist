package com.oncoassist.oncoassist.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class QuestionSuiviResponseDTO {
    private UUID id;
    private String texte;
    private List<String> choix;
    private Integer ordre;
    private boolean globale; // true si patient = NULL
}