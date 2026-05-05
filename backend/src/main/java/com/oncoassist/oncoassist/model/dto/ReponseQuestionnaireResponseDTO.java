package com.oncoassist.oncoassist.model.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class ReponseQuestionnaireResponseDTO {
    private UUID id;
    private String texteQuestion;
    private String choixSelectionne;
    private LocalDate dateReponse;
}