package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.dto.AttributionRequestDTO;
import com.oncoassist.oncoassist.model.dto.QuestionSuiviRequestDTO;
import com.oncoassist.oncoassist.model.dto.QuestionSuiviResponseDTO;
import com.oncoassist.oncoassist.service.QuestionnaireService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/questionnaire")
@RequiredArgsConstructor
public class QuestionnaireController {

    private final QuestionnaireService questionnaireService;

    // GET questions globales → ADMIN, MEDECIN, SECRETAIRE
    @GetMapping("/globales")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MEDECIN', 'SECRETAIRE')")
    public ResponseEntity<List<QuestionSuiviResponseDTO>> getGlobales() {
        return ResponseEntity.ok(
                questionnaireService.getQuestionsGlobales());
    }

    // GET questions pour un patient → MEDECIN + PATIENT
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('MEDECIN', 'PATIENT')")
    public ResponseEntity<List<QuestionSuiviResponseDTO>> getQuestions(
            @PathVariable UUID patientId) {
        return ResponseEntity.ok(
                questionnaireService.getQuestionsForPatient(patientId));
    }

    // POST ajouter question globale → MEDECIN seulement
    @PostMapping("/globale")
    @PreAuthorize("hasAnyAuthority('MEDECIN')")
    public ResponseEntity<QuestionSuiviResponseDTO> ajouterGlobale(
            @RequestBody QuestionSuiviRequestDTO dto) {
        return ResponseEntity.ok(
                questionnaireService.ajouterQuestionGlobale(dto));
    }

    // POST ajouter question custom pour un patient → MEDECIN seulement
    @PostMapping("/patient/{patientId}/ajouter")
    @PreAuthorize("hasAnyAuthority('MEDECIN')")
    public ResponseEntity<QuestionSuiviResponseDTO> ajouterCustom(
            @PathVariable UUID patientId,
            @RequestBody QuestionSuiviRequestDTO dto) {
        return ResponseEntity.ok(
                questionnaireService.ajouterQuestionCustom(patientId, dto));
    }

    // PUT modifier une question → MEDECIN seulement
    @PutMapping("/{questionId}")
    @PreAuthorize("hasAnyAuthority('MEDECIN')")
    public ResponseEntity<QuestionSuiviResponseDTO> updateQuestion(
            @PathVariable UUID questionId,
            @RequestBody QuestionSuiviRequestDTO dto) {
        return ResponseEntity.ok(
                questionnaireService.updateQuestion(questionId, dto));
    }

    // DELETE supprimer une question → MEDECIN seulement
    @DeleteMapping("/{questionId}")
    @PreAuthorize("hasAnyAuthority('MEDECIN')")
    public ResponseEntity<Void> supprimer(
            @PathVariable UUID questionId) {
        questionnaireService.supprimerQuestion(questionId);
        return ResponseEntity.noContent().build();
    }

    // POST attribuer questionnaire → MEDECIN seulement
    @PostMapping("/attribuer")
    @PreAuthorize("hasAnyAuthority('MEDECIN')")
    public ResponseEntity<Void> attribuer(
            @RequestBody AttributionRequestDTO dto) {
        questionnaireService.attribuerQuestionnaire(dto);
        return ResponseEntity.ok().build();
    }
}