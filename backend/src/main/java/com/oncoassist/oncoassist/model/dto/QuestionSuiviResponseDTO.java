package com.oncoassist.oncoassist.model.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class QuestionSuiviResponseDTO {
    private UUID id;
    private String texte;
    private List<String> choix;
    private Integer ordre;
    private boolean globale;
}