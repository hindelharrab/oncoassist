package com.oncoassist.oncoassist.model.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class QuestionSuiviRequestDTO {
    private String texte;
    private List<String> choix;
    private Integer ordre;
}