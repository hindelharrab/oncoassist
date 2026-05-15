// ImageAnalyseDTO.java
package com.oncoassist.oncoassist.model.dto;

import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ImageAnalyseDTO {
    private UUID id;
    private String cheminImage;
    private String cheminGradCam;
}