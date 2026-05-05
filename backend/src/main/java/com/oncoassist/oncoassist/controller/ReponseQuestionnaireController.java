package com.oncoassist.oncoassist.controller;
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
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Void> soumettre(
            @PathVariable UUID patientId,
            @RequestBody ReponseQuestionnaireRequestDTO dto) {
        reponseService.soumettreReponses(patientId, dto);
        return ResponseEntity.ok().build();
    }

    // Médecin consulte toutes les réponses d'un patient
    @GetMapping("/medecin/patient/{patientId}")
    @PreAuthorize("hasRole('MEDECIN')")
    public ResponseEntity<List<ReponseQuestionnaireResponseDTO>> getToutesReponses(
            @PathVariable UUID patientId) {
        return ResponseEntity.ok(
                reponseService.getToutesReponses(patientId));
    }

    // Médecin consulte réponses par question → pour graphiques
    @GetMapping("/medecin/patient/{patientId}/question/{questionId}")
    @PreAuthorize("hasRole('MEDECIN')")
    public ResponseEntity<List<ReponseQuestionnaireResponseDTO>> getReponsesParQuestion(
            @PathVariable UUID patientId,
            @PathVariable UUID questionId) {
        return ResponseEntity.ok(
                reponseService.getReponsesParQuestion(patientId, questionId));
    }
}