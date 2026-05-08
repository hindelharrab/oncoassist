package com.oncoassist.oncoassist.model.dto.consultation;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ExamenManuelRequestDTO {
    @NotNull
    private Boolean massePalpee;
    private String localisationDeMasse;
    private String siteAnatomique;
    // champs supplémentaires affichés dans le front
    private String aspectPeau;
    private String adenopathies;
    private String description; // = "massePalpee" texte libre dans le front
}