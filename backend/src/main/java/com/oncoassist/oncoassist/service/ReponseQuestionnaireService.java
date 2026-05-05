package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.ReponseItemDTO;
import com.oncoassist.oncoassist.model.dto.ReponseQuestionnaireRequestDTO;
import com.oncoassist.oncoassist.model.dto.ReponseQuestionnaireResponseDTO;
import com.oncoassist.oncoassist.model.entity.AttributionQuestionnaire;
import com.oncoassist.oncoassist.model.entity.Patient;
import com.oncoassist.oncoassist.model.entity.QuestionnaireSuivi;
import com.oncoassist.oncoassist.model.entity.ReponseQuestionnaire;
import com.oncoassist.oncoassist.repository.AttributionQuestionnaireRepository;
import com.oncoassist.oncoassist.repository.PatientRepository;
import com.oncoassist.oncoassist.repository.QuestionnaireSuiviRepository;
import com.oncoassist.oncoassist.repository.ReponseQuestionnaireRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReponseQuestionnaireService {

    private final ReponseQuestionnaireRepository reponseRepo;
    private final PatientRepository patientRepo;
    private final QuestionnaireSuiviRepository questionRepo;
    private final AttributionQuestionnaireRepository attributionRepo;

    // Patient soumet ses réponses
    public void soumettreReponses(UUID patientId,
                                  ReponseQuestionnaireRequestDTO dto) {

        Patient patient = patientRepo.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient non trouvé"));

        AttributionQuestionnaire attribution = attributionRepo
                .findById(dto.getAttributionId())
                .orElseThrow(() -> new RuntimeException("Attribution non trouvée"));

        for (ReponseItemDTO item : dto.getReponses()) {
            QuestionnaireSuivi question = questionRepo
                    .findById(item.getQuestionId())
                    .orElseThrow(() -> new RuntimeException("Question non trouvée"));

            ReponseQuestionnaire reponse = new ReponseQuestionnaire();
            reponse.setPatient(patient);
            reponse.setQuestion(question);
            reponse.setAttribution(attribution);
            reponse.setChoixSelectionne(item.getChoixSelectionne());
            reponse.setDateReponse(LocalDate.now());
            reponseRepo.save(reponse);
        }
    }

    // Médecin consulte les réponses d'un patient par question
    // → pour afficher les graphiques
    public List<ReponseQuestionnaireResponseDTO> getReponsesParQuestion(
            UUID patientId, UUID questionId) {

        return reponseRepo
                .findByPatientIdAndQuestionIdOrderByDateReponse(patientId, questionId)
                .stream()
                .map(r -> {
                    ReponseQuestionnaireResponseDTO dto =
                            new ReponseQuestionnaireResponseDTO();
                    dto.setId(r.getId());
                    dto.setTexteQuestion(r.getQuestion().getTexte());
                    dto.setChoixSelectionne(r.getChoixSelectionne());
                    dto.setDateReponse(r.getDateReponse());
                    return dto;
                })
                .toList();
    }

    // Médecin consulte toutes les réponses d'un patient
    public List<ReponseQuestionnaireResponseDTO> getToutesReponses(UUID patientId) {
        return reponseRepo
                .findByPatientIdOrderByDateReponse(patientId)
                .stream()
                .map(r -> {
                    ReponseQuestionnaireResponseDTO dto =
                            new ReponseQuestionnaireResponseDTO();
                    dto.setId(r.getId());
                    dto.setTexteQuestion(r.getQuestion().getTexte());
                    dto.setChoixSelectionne(r.getChoixSelectionne());
                    dto.setDateReponse(r.getDateReponse());
                    return dto;
                })
                .toList();
    }
}