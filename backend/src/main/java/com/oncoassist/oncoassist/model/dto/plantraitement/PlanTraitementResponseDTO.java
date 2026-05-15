package com.oncoassist.oncoassist.model.dto.plantraitement;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PlanTraitementResponseDTO {
    private UUID id;
    private LocalDate dateConsultation;
    private String etape;
    private String statut;
    private Boolean visiblePatient;
    private String prochaineEtape;

    // Auteur
    private UUID auteurId;
    private String auteurNom;
    private String auteurPrenom;

    // Ordonnance liée (Document type ORDONNANCE créé au même moment)
    private UUID ordonnanceId;
    private String ordonnanceContenu;
    private Boolean ordonnanceVisiblePatient;
}