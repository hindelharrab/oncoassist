package com.oncoassist.oncoassist.model.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class ReponseQuestionnaireRequestDTO {
    private UUID attributionId;
    // liste de réponses : une par question
    private List<ReponseItemDTO> reponses;
}