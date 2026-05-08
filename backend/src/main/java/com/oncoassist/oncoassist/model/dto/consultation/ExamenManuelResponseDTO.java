package com.oncoassist.oncoassist.model.dto.consultation;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ExamenManuelResponseDTO {
    private UUID id;
    private LocalDateTime date;
    private String siteAnatomique;
    private Boolean massePalpee;
    private String localisationDeMasse;
    private String aspectPeau;
    private String adenopathies;
    private String description;
    private String notes;          // ← ajouter cette ligne
    private Boolean visiblePatient;
    private String auteurNom;
    private String auteurPrenom;
}