package com.oncoassist.oncoassist.model.dto.document;

import com.oncoassist.oncoassist.model.entity.enums.DocTypeEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class DocumentRequestDTO {

    @NotBlank
    private String nom;

    @NotNull
    private DocTypeEnum type;

    // Le contenu texte (ordonnance, note de résultat...)
    // Stocké dans cheminFichier pour les documents texte
    @NotBlank
    private String contenu;

    private Boolean partagePatient = false;

    // Étape associée (ex: "IRM", "Examen manuel") — pour affichage dans la liste
    private String etape;

    // Médecin auteur — pour affichage
    private UUID medecinId;

    // id de l'examen source pour retrouver les données
    private UUID examenSourceId;
    private String examenSourceType; // "MANUEL","ECHO","IRM","BIOPSIE","MAMMO"

}
