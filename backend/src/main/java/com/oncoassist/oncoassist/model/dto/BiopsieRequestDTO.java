// BiopsieRequestDTO.java
package com.oncoassist.oncoassist.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class BiopsieRequestDTO {
    private UUID dossierId;
    private String siteAnatomique;
    private String grossissement;
    private Boolean visiblePatient;
    private LocalDateTime date;
    private String notes;
}