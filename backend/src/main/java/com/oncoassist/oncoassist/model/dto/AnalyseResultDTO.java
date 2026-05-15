// AnalyseResultDTO.java
package com.oncoassist.oncoassist.model.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AnalyseResultDTO {
    private String classeBinaire;
    private Float scoreBenignMalin;
    private String typeTumeur;
    private Float scoreTypeConfiance;
    private List<ImageAnalyseDTO> imagesAnalysees;
}