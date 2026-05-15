package com.oncoassist.oncoassist.model.dto.echographie;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class EchographieRequestDTO {

    @NotNull
    private UUID medecinId;

    // Localisation
    private String seinExamine;       // "Droit" / "Gauche" / "Bilatéral"
    private String quadrant;          // "QSE", "QSI"...
    private Double distanceMamelon;   // en cm

    // Type
    private String typeStructure;     // "Masse", "Kyste"...

    // Morphologie
    private String forme;
    private String orientation;
    private String contours;
    private String echostructure;

    // Dimensions
    private Double tailleAxe1;
    private Double tailleAxe2;
    private Double tailleAxe3;

    // Acoustique & Doppler
    private String effetsPosterieurs;
    private String vascularisationDoppler;

    // Booléens — le front envoie "Oui"/"Non" → on convertit dans le service
    private String calcificationsPresentes;  // "Oui" / "Non"
    private String adenopathieAxillaire;     // "Oui" / "Non"

    // Score BI-RADS — le front envoie "1","2"..."6" → on mappe vers l'enum
    private String scoreBIRADS;

    // Conclusion
    private String recommandation;
    private String resultatDetaille;  // = "resulatat" dans le front

    // Image uploadée (nom du fichier après stockage)
    private String imageRadio;
}
