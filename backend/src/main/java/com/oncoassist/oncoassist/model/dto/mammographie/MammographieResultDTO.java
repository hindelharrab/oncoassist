package com.oncoassist.oncoassist.model.dto.mammographie;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.Map;

@Data
public class MammographieResultDTO {

    // Résultat principal
    private String prediction;
    private Double score;

    @JsonProperty("confidence_pct")
    private Double confidencePct;

    // BI-RADS
    @JsonProperty("birads_label")
    private String biradsLabel;

    @JsonProperty("birads_description")
    private String biradsDescription;

    private String recommendation;
    private String action;

    @JsonProperty("birads_color")
    private String biradsColor;

    // Localisation
    private String quadrant;

    @JsonProperty("quadrant_short")
    private String quadrantShort;

    @JsonProperty("position_text")
    private String positionText;

    private Map<String, Object> bbox;

    // Images base64
    @JsonProperty("image_original")
    private String imageOriginal;

    @JsonProperty("image_heatmap")
    private String imageHeatmap;

    @JsonProperty("image_bbox")
    private String imageBbox;
}