package com.oncoassist.oncoassist.model.entity;

import com.oncoassist.oncoassist.model.entity.enums.BIRADSEnum;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "echographies")
@DiscriminatorValue("ECHOGRAPHIE")
@Getter @Setter
public class Echographie extends Examen {

    @Column(name = "image_radio", nullable = false)
    private String imageRadio;

    // ── Déjà présent ──────────────────────────────
    @Column(name = "type_structure")
    private String typeStructure; // KYSTE_SIMPLE / NODULE_SOLIDE / LESION_COMPLEXE

    @Column(name = "quadrant")
    private String quadrant;             // QSE / QSI / QIE / QII / CSE / CSI

    @Column(name = "distance_mamelon_cm")
    private Double distanceMamelon;      // en cm

    // ── Morphologie ───────────────────────────────
    @Column(name = "forme")
    private String forme;                // OVALE / RONDE / IRREGULIERE

    @Column(name = "orientation")
    private String orientation;          // PARALLELE / NON_PARALLELE

    @Column(name = "contours")
    private String contours;             // CIRCONSCRITS / INDISTINCTS / SPICULES

    @Column(name = "echostructure")
    private String echostructure;        // ANECHOGENE / HYPOECHOGENE / HETEROGENE

    // ── Dimensions (mm) ───────────────────────────
    @Column(name = "taille_axe1_mm")
    private Double tailleAxe1;

    @Column(name = "taille_axe2_mm")
    private Double tailleAxe2;

    @Column(name = "taille_axe3_mm")
    private Double tailleAxe3;

    // ── Acoustique ────────────────────────────────
    @Column(name = "effets_posterieurs")
    private String effetsPosterieurs;    // RENFORCEMENT / ATTENUATION / ABSENT

    // ── Doppler ───────────────────────────────────
    @Column(name = "vascularisation_doppler")
    private String vascularisationDoppler; // ABSENTE / PERILESIONNELLE / INTRALESIONNELLE

    // ── Calcifications ────────────────────────────
    @Column(name = "calcifications_presentes")
    private Boolean calcificationsPresentes;

    // ── Ganglions ─────────────────────────────────
    @Column(name = "adenopathie_axillaire")
    private Boolean adenopathieAxillaire;

    // ── Classification ────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "score_birads")
    private BIRADSEnum scoreBIRADS;      // Réutilise ton enum existant ✅

    // ── Élastographie (optionnel) ─────────────────
    @Column(name = "score_elastographie")
    private Integer scoreElastographie; // 1 (mou) → 5 (dur)

    // ── Conclusion ────────────────────────────────
    @Column(name = "recommandation")
    private String recommandation;       // SURVEILLANCE / BIOPSIE / IRM_COMPLEMENTAIRE

}