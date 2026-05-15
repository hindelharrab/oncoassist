package com.oncoassist.oncoassist.model.dto.plantraitement;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PlanTraitementRequestDTO {

    @NotNull
    private UUID medecinId;

    @NotNull
    private LocalDate dateConsultation;

    private String etape;
    private String statut;
    private Boolean visiblePatient;
    private String prochaineEtape;

    // ✅ Ordonnance → sera stockée dans table documents par le service
    private String ordonnance;
    private Boolean ordonnanceVisiblePatient;


    // ✅ motifRdv N'EST PLUS ICI
    // Le RDV est créé séparément via POST /api/rendez-vous/demander
    // déclenché par le bouton "Demander RDV Secrétaire" dans le front
}