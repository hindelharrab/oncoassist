package com.oncoassist.oncoassist.model.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder
public class ExamenDTO {
    private UUID id;
    private String typeExamen;          // discriminator value
    private LocalDateTime date;
    private String siteAnatomique;
    private Boolean visiblePatient;

    // Image — priorité : imageRadio > fichierImage > imagesAnalysees[0]
    private String imageRadio;          // Mammographie, Échographie
    private String fichierImage;        // IRM

    // Résultat textuel
    private ResultatDTO resultat;

    // Sous-champs selon type (utiles pour la page détail)
    private String scoreBIRADS;
    private String classeBinaire;
    private Float  scoreBenignMalin;
    private String typeTumeur;
    private Boolean massePalpee;
    private String localisationDeMasse;
    private String description;
}
