package com.oncoassist.oncoassist.model.entity;

import com.oncoassist.oncoassist.model.entity.enums.BIRADSEnum;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mammographies")
@DiscriminatorValue("MAMMOGRAPHIE")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class Mammographie extends Examen {

    // ── Image originale uploadée ──────────────────────────
    @Column(name = "image_radio")
    private String imageRadio;

    // ── Résultats IA ──────────────────────────────────────

    // Score brut sigmoid [0.0 - 1.0]
    @Column(name = "score_risque_ia")
    private Float scoreRisqueIA;

    // Score en pourcentage [0 - 100]
    @Column(name = "confidence_pct")
    private Float confidencePct;

    // BENIGN ou MALIGNANT
    @Column(name = "prediction_ia")
    private String predictionIA;

    // BI-RADS (enum existant)
    @Enumerated(EnumType.STRING)
    @Column(name = "score_birads")
    private BIRADSEnum scoreBIRADS;

    // Description BI-RADS ex: "Suspicion intermédiaire"
    @Column(name = "birads_description")
    private String biradsDescription;

    // Recommandation ex: "Biopsie écho-guidée recommandée"
    @Column(name = "recommendation_ia", length = 500)
    private String recommendationIA;

    // Action ex: "biopsie_recommandee"
    @Column(name = "action_ia")
    private String actionIA;

    // ── Localisation ──────────────────────────────────────

    // Ex: "Quadrant supéro-externe"
    @Column(name = "quadrant")
    private String quadrant;

    // Ex: "QSE"
    @Column(name = "quadrant_short")
    private String quadrantShort;

    // Ex: "Quadrant supéro-externe, zone médio-mammaire"
    @Column(name = "position_text", length = 300)
    private String positionText;

    // Bounding box stockée en JSON
    // Ex: {"x":120,"y":80,"w":45,"h":38,"hot_x":142,...}
    @Column(name = "bbox_json", length = 500)
    private String bboxJson;

    // ── Chemins des images générées ───────────────────────
    // Image originale preprocessée sauvegardée
    @Column(name = "heatmap_url")
    private String heatmapUrl;

    // Image avec bounding box
    @Column(name = "bbox_image_url")
    private String bboxImageUrl;
}