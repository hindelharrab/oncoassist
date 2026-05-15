package com.oncoassist.oncoassist.model.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data @Builder
public class ResultatDTO {
    private UUID id;
    private String contenu;       // champ principal affiché
    private String description;
    private String cheminFichier;
}
