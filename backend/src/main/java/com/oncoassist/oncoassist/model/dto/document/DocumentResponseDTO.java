package com.oncoassist.oncoassist.model.dto.document;

import com.oncoassist.oncoassist.model.entity.enums.DocTypeEnum;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class DocumentResponseDTO {
    private UUID id;
    private String nom;
    private DocTypeEnum type;
    private String contenu;          // = cheminFichier pour les docs texte
    private LocalDate dateAjout;
    private Boolean partagePatient;

    // Infos extraites du nom pour affichage dans le front
    private String etape;            // ex: "IRM", "Examen manuel"
    private String medecinNom;
    private String medecinPrenom;

    private UUID        examenSourceId;
    private String      examenSourceType;
}