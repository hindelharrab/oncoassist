package com.oncoassist.oncoassist.model.entity;

import com.oncoassist.oncoassist.model.entity.enums.BIRADSEnum;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "irms")
@DiscriminatorValue("IRM")

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)

public class IRM extends Examen {

    // ✅ nullable — l'image est optionnelle à la création
    @Column(name = "fichier_image")
    private String fichierImage;

    @Column(name = "sequences")
    private String sequences;

    // ✅ pas de nullable = false sur les booléens
    @Column(name = "produit_contraste")
    private Boolean produitContraste;

    @Column(name = "quadrant")
    private String quadrant;

    // ── Morphologie ───────────────────────────────────────────
    @Column(name = "forme_lesion")
    private String formeLesion;

    @Column(name = "contours_lesion")
    private String contoursLesion;

    @Column(name = "signal_t2")
    private String signalT2;

    // ── Dimensions (mm) ───────────────────────────────────────
    @Column(name = "taille_axe1_mm")
    private Double tailleAxe1;

    @Column(name = "taille_axe2_mm")
    private Double tailleAxe2;

    @Column(name = "taille_axe3_mm")
    private Double tailleAxe3;

    // ── Cinétique ─────────────────────────────────────────────
    @Column(name = "type_rehaussement")
    private String typeRehaussement;

    @Column(name = "cinetique_rehaussement")
    private String cinematiqueRehaussement;

    // ── Diffusion ─────────────────────────────────────────────
    @Column(name = "restriction_diffusion")
    private Boolean restrictionDiffusion;

    @Column(name = "valeur_adc")
    private Double valeurAdc;

    // ── Ganglions ─────────────────────────────────────────────
    @Column(name = "adenopathie_axillaire")
    private Boolean adenopathieAxillaire;

    @Column(name = "adenopathie_mediastinale")
    private Boolean adenopathieMediastinale;

    // ── Extension ─────────────────────────────────────────────
    @Column(name = "extension_paroi")
    private Boolean extensionParoi;

    @Column(name = "extension_cutanee")
    private Boolean extensionCutanee;

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

    // ── Sein examiné ──────────────────────────────────────────
    @Column(name = "sein_examine")
    private String seinExamine;
}