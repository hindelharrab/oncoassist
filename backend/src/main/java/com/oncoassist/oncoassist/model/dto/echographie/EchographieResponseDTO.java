package com.oncoassist.oncoassist.model.dto.echographie;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class EchographieResponseDTO {
    private UUID id;
    private LocalDateTime date;
    private Boolean visiblePatient;

    // Auteur
    private String auteurNom;
    private String auteurPrenom;

    // Localisation
    private String seinExamine;
    private String quadrant;
    private Double distanceMamelon;

    // Type
    private String typeStructure;

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

    // Booléens → renvoyés comme String "Oui"/"Non" pour le front
    private String calcificationsPresentes;
    private String adenopathieAxillaire;

    // Score BI-RADS → renvoyé comme String "1"..."6"
    private String scoreBIRADS;

    // Conclusion
    private String recommandation;
    private String resultatDetaille;

    // Image
    private String imageRadio;
}