package com.oncoassist.oncoassist.model.dto.irm;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class IRMRequestDTO {

    @NotNull
    private UUID medecinId;

    private String seinExamine;
    private String sequences;
    private String produitContraste;   // "Gadolinium" / "Non" → converti en Boolean
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

    // Diffusion — "Oui"/"Non" → Boolean dans le service
    private String restrictionDiffusion;
    private Double valeurAdc;

    // Ganglions — "Oui"/"Non" → Boolean
    private String adenopathieAxillaire;
    private String adenopathieMediastinale;

    // Extension — "Oui"/"Non" → Boolean
    private String extensionParoi;
    private String extensionCutanee;

    // Score BI-RADS — String libre ("4c", "5"...) stocké tel quel
    // On le mappe vers BIRADSEnum si possible, sinon on stocke dans recommandation
    private String scoreBIRADS;

    private String recommandation;
    private String resultatDetaille;   // = "resulatat" dans le front

    // Image (optionnel — uploadée séparément)
    private String fichierImage;
}
