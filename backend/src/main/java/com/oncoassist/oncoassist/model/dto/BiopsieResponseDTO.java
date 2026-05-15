// BiopsieResponseDTO.java
package com.oncoassist.oncoassist.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class BiopsieResponseDTO {
    private UUID id;
    private LocalDateTime date;
    private String siteAnatomique;
    private String grossissement;
    private Boolean visiblePatient;
    private String auteurNom;
    private String auteurPrenom;
    private String classeBinaire;
    private Float scoreBenignMalin;
    private String typeTumeur;
    private Float scoreTypeConfiance;
    private String notes;
    private Boolean isAnalysed;
    private List<ImageAnalyseDTO> imagesAnalysees;
}