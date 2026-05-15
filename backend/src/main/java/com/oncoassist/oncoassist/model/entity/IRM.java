package com.oncoassist.oncoassist.model.entity;

import com.oncoassist.oncoassist.model.entity.enums.BIRADSEnum;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "irms")
@DiscriminatorValue("IRM")
@Getter @Setter
public class IRM extends Examen {

    @Column(name = "fichier_image", nullable = false)
    private String fichierImage;

    // ── Déjà présent ──────────────────────────────
    private String sequences;            // T1 / T2 / FLAIR / DWI / DCE

    @Column(name = "produit_contraste", nullable = false)
    private Boolean produitContraste = false;

    @Column(name = "quadrant")
    private String quadrant;

    // ── Morphologie de la lésion ──────────────────
    @Column(name = "forme_lesion")
    private String formeLesion;          // MASSE / NON_MASSE / FOYER

    @Column(name = "contours_lesion")
    private String contoursLesion;       // REGULIERS / IRREGULIERS / SPICULES

    @Column(name = "signal_t2")
    private String signalT2;             // HYPERSIGNAL / HYPOSIGNAL / ISOSIGNAL

    // ── Dimensions (mm) ───────────────────────────
    @Column(name = "taille_axe1_mm")
    private Double tailleAxe1;

    @Column(name = "taille_axe2_mm")
    private Double tailleAxe2;

    @Column(name = "taille_axe3_mm")
    private Double tailleAxe3;

    // ── Cinétique de rehaussement (après injection) ─
    @Column(name = "type_rehaussement")
    private String typeRehaussement;     // HOMOGENE / HETEROGENE / EN_ANNEAU

    @Column(name = "cinetique_rehaussement")
    private String cinematiqueRehaussement; // PROGRESSIF / PLATEAU / WASHOUT

    // ── Diffusion (DWI / ADC) ─────────────────────
    @Column(name = "restriction_diffusion")
    private Boolean restrictionDiffusion;

    @Column(name = "valeur_adc")
    private Double valeurAdc;            // en mm²/s (ex: 0.8 = suspect)

    // ── Ganglions ─────────────────────────────────
    @Column(name = "adenopathie_axillaire")
    private Boolean adenopathieAxillaire;

    @Column(name = "adenopathie_mediastinale")
    private Boolean adenopathieMediastinale;

    // ── Extension ─────────────────────────────────
    @Column(name = "extension_paroi")
    private Boolean extensionParoi;      // envahissement paroi thoracique

    @Column(name = "extension_cutanee")
    private Boolean extensionCutanee;

    // ── Classification ────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "score_birads")
    private BIRADSEnum scoreBIRADS;      // Réutilise ton enum existant ✅

    // ── Conclusion ────────────────────────────────
    @Column(name = "recommandation")
    private String recommandation;       // SURVEILLANCE / BIOPSIE / CHIRURGIE
}