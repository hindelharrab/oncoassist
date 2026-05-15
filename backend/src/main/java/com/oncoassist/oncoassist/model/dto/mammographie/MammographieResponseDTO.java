package com.oncoassist.oncoassist.model.dto.mammographie;

import com.oncoassist.oncoassist.model.entity.enums.BIRADSEnum;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class MammographieResponseDTO {

    private UUID id;
    private UUID dossierId;
    private LocalDateTime dateExamen;

    // Résultats IA
    private String predictionIA;
    private Float  scoreRisqueIA;
    private Float  confidencePct;
    private BIRADSEnum scoreBIRADS;
    private String biradsDescription;
    private String recommendationIA;
    private String actionIA;

    // Localisation
    private String quadrant;
    private String quadrantShort;
    private String positionText;
    private String bboxJson;

    // Images base64 (affichage immédiat)
    private String imageOriginal;
    private String imageHeatmap;
    private String imageBbox;

    // Chemins fichiers (stockés en base)
    private String imageRadio;
    private String heatmapUrl;
    private String bboxImageUrl;
}