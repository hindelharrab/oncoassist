package com.oncoassist.oncoassist.model.entity;

import com.oncoassist.oncoassist.model.entity.enums.BIRADSEnum;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "echographies")
@DiscriminatorValue("ECHOGRAPHIE")

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)

public class Echographie extends Examen {

    // ── Image ─────────────────────────────────────────────────
    @Column(name = "image_radio")
    private String imageRadio;

    // ── Localisation ──────────────────────────────────────────
    // "Droit" / "Gauche" / "Bilatéral" — vient du front comme String
    @Column(name = "sein_examine")
    private String seinExamine;

    @Column(name = "quadrant")
    private String quadrant;

    @Column(name = "distance_mamelon_cm")
    private Double distanceMamelon;

    // ── Type de structure ─────────────────────────────────────
    @Column(name = "type_structure")
    private String typeStructure;

    // ── Morphologie ───────────────────────────────────────────
    @Column(name = "forme")
    private String forme;

    @Column(name = "orientation")
    private String orientation;

    @Column(name = "contours")
    private String contours;

    @Column(name = "echostructure")
    private String echostructure;

    // ── Dimensions (mm) ───────────────────────────────────────
    @Column(name = "taille_axe1_mm")
    private Double tailleAxe1;

    @Column(name = "taille_axe2_mm")
    private Double tailleAxe2;

    @Column(name = "taille_axe3_mm")
    private Double tailleAxe3;

    // ── Acoustique ────────────────────────────────────────────
    @Column(name = "effets_posterieurs")
    private String effetsPosterieurs;

    // ── Doppler ───────────────────────────────────────────────
    @Column(name = "vascularisation_doppler")
    private String vascularisationDoppler;

    // ── Calcifications ────────────────────────────────────────
    // Stocké Boolean en base mais le front envoie "Oui"/"Non"
    @Column(name = "calcifications_presentes")
    private Boolean calcificationsPresentes;

    // ── Ganglions ─────────────────────────────────────────────
    @Column(name = "adenopathie_axillaire")
    private Boolean adenopathieAxillaire;

    // ── Score BI-RADS ─────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "score_birads")
    private BIRADSEnum scoreBIRADS;

    // ── Conclusion ────────────────────────────────────────────
    @Column(name = "recommandation", columnDefinition = "TEXT")
    private String recommandation;

    // ── Résultat détaillé (= "resulatat" dans le front) ───────
    @Column(name = "resultat_detaille", columnDefinition = "TEXT")
    private String resultatDetaille;
}