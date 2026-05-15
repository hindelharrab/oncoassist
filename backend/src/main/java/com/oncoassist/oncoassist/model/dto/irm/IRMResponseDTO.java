package com.oncoassist.oncoassist.model.dto.irm;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class IRMResponseDTO {
    private UUID id;
    private LocalDateTime date;
    private Boolean visiblePatient;

    // Auteur
    private String auteurNom;
    private String auteurPrenom;

    // Localisation
    private String seinExamine;
    private String sequences;
    private String produitContraste;   // renvoyé comme String
    private String quadrant;

    // Morphologie
    private String formeLesion;
    private String contoursLesion;
    private String signalT2;

    // Dimensions
    private Double tailleAxe1;
    private Double tailleAxe2;
    private Double tailleAxe3;

    // Cinétique
    private String typeRehaussement;
    private String cinematiqueRehaussement;

    // Diffusion — renvoyé comme "Oui"/"Non"
    private String restrictionDiffusion;
    private Double valeurAdc;

    // Ganglions — renvoyé comme "Oui"/"Non"
    private String adenopathieAxillaire;
    private String adenopathieMediastinale;

    // Extension — renvoyé comme "Oui"/"Non"
    private String extensionParoi;
    private String extensionCutanee;

    // Score BI-RADS — renvoyé comme String
    private String scoreBIRADS;

    private String recommandation;
    private String resultatDetaille;
    private String fichierImage;
}
