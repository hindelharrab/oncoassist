package com.oncoassist.oncoassist.controller;
import com.oncoassist.oncoassist.model.dto.QuestionSyntheseDTO;
import com.oncoassist.oncoassist.model.dto.ReponseQuestionnaireRequestDTO;
import com.oncoassist.oncoassist.model.dto.ReponseQuestionnaireResponseDTO;
import com.oncoassist.oncoassist.service.ReponseQuestionnaireService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reponses")
@RequiredArgsConstructor
public class ReponseQuestionnaireController {

    private final ReponseQuestionnaireService reponseService;

    // Patient soumet ses réponses → PATIENT seulement (Flutter)
    @PostMapping("/patient/{patientId}/soumettre")
    @PreAuthorize("hasAnyAuthority('PATIENT')")
    public ResponseEntity<Void> soumettre(
            @PathVariable UUID patientId,
            @RequestBody ReponseQuestionnaireRequestDTO dto) {
        reponseService.soumettreReponses(patientId, dto);
        return ResponseEntity.ok().build();
    }

    // Médecin consulte toutes les réponses d'un patient
    @GetMapping("/medecin/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('MEDECIN')")
    public ResponseEntity<List<ReponseQuestionnaireResponseDTO>> getToutesReponses(
            @PathVariable UUID patientId) {
        return ResponseEntity.ok(
                reponseService.getToutesReponses(patientId));
    }

    // Médecin consulte réponses par question → pour graphiques
    @GetMapping("/medecin/patient/{patientId}/question/{questionId}")
    @PreAuthorize("hasAnyAuthority('MEDECIN')")
    public ResponseEntity<List<ReponseQuestionnaireResponseDTO>> getReponsesParQuestion(
            @PathVariable UUID patientId,
            @PathVariable UUID questionId) {
        return ResponseEntity.ok(
                reponseService.getReponsesParQuestion(patientId, questionId));
    }
    // GET réponses groupées par question pour la vue ensemble
    @GetMapping("/medecin/patient/{patientId}/synthese")
    @PreAuthorize("hasAnyAuthority('MEDECIN')")
    public ResponseEntity<List<QuestionSyntheseDTO>> getSynthese(
            @PathVariable UUID patientId) {
        return ResponseEntity.ok(reponseService.getSynthese(patientId));
    }
}