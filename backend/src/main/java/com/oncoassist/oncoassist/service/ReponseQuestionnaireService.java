package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.QuestionSyntheseDTO;
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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReponseQuestionnaireService {

    private final ReponseQuestionnaireRepository reponseRepo;
    private final PatientRepository              patientRepo;
    private final QuestionnaireSuiviRepository   questionRepo;
    private final AttributionQuestionnaireRepository attributionRepo;

    // Patient soumet ses réponses
    @Transactional
    public void soumettreReponses(
            UUID patientId,
            ReponseQuestionnaireRequestDTO dto) {

        Patient patient = patientRepo.findById(patientId)
                .orElseThrow(() ->
                        new RuntimeException("Patient non trouvé"));

        // ✅ attributionId peut être null (Flutter envoie null si pas d'attribution active)
        AttributionQuestionnaire attribution = null;
        if (dto.getAttributionId() != null) {
            attribution = attributionRepo.findById(dto.getAttributionId())
                    .orElseThrow(() ->
                            new RuntimeException("Attribution non trouvée"));
        }

        for (ReponseItemDTO item : dto.getReponses()) {
            QuestionnaireSuivi question =
                    questionRepo.findById(item.getQuestionId())
                            .orElseThrow(() ->
                                    new RuntimeException("Question non trouvée"));

            ReponseQuestionnaire reponse = new ReponseQuestionnaire();
            reponse.setPatient(patient);
            reponse.setQuestion(question);
            reponse.setAttribution(attribution); // ✅ peut être null
            reponse.setChoixSelectionne(item.getChoixSelectionne());
            reponse.setDateReponse(LocalDate.now());
            reponseRepo.save(reponse);
        }
    }

    // Médecin consulte toutes les réponses d'un patient
    @Transactional(readOnly = true)
    public List<ReponseQuestionnaireResponseDTO> getToutesReponses(
            UUID patientId) {
        return reponseRepo
                .findByPatientIdOrderByDateReponse(patientId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // Médecin consulte les réponses par question (pour graphiques)
    @Transactional(readOnly = true)
    public List<ReponseQuestionnaireResponseDTO> getReponsesParQuestion(
            UUID patientId, UUID questionId) {
        return reponseRepo
                .findByPatientIdAndQuestionIdOrderByDateReponse(
                        patientId, questionId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ── Mapper ────────────────────────────────────
    private ReponseQuestionnaireResponseDTO toDTO(ReponseQuestionnaire r) {
        ReponseQuestionnaireResponseDTO dto =
                new ReponseQuestionnaireResponseDTO();
        dto.setId(r.getId());
        dto.setTexteQuestion(
                r.getQuestion() != null
                        ? r.getQuestion().getTexte()
                        : "");
        dto.setChoixSelectionne(r.getChoixSelectionne());
        dto.setDateReponse(r.getDateReponse());
        return dto;
    }


    // ── Mapper ────────────────────────────────────
    @Transactional(readOnly = true)
    public List<QuestionSyntheseDTO> getSynthese(UUID patientId) {
        List<ReponseQuestionnaire> toutes =
                reponseRepo.findByPatientIdOrderByDateReponse(patientId);

        // Grouper par question
        Map<QuestionnaireSuivi, List<ReponseQuestionnaire>> parQuestion =
                toutes.stream().collect(
                        java.util.stream.Collectors.groupingBy(
                                ReponseQuestionnaire::getQuestion,
                                java.util.LinkedHashMap::new,
                                java.util.stream.Collectors.toList()
                        )
                );

        return parQuestion.entrySet().stream().map(entry -> {
            QuestionnaireSuivi q = entry.getKey();
            List<ReponseQuestionnaire> reponses = entry.getValue();
            QuestionSyntheseDTO dto = new QuestionSyntheseDTO();
            dto.setQuestionId(q.getId());
            dto.setTexte(q.getTexte());
            dto.setType(q.getType() != null ? q.getType() : "unique");
            dto.setGlobale(q.getPatient() == null);

            if ("multiple".equals(q.getType())) {
                // Fréquence de chaque choix
                Map<String, Long> freq = reponses.stream().collect(
                        java.util.stream.Collectors.groupingBy(
                                ReponseQuestionnaire::getChoixSelectionne,
                                java.util.stream.Collectors.counting()
                        )
                );
                dto.setRepartition(freq.entrySet().stream()
                        .map(e -> new QuestionSyntheseDTO.ChoixFrequence(e.getKey(), e.getValue()))
                        .sorted((a, b) -> Long.compare(b.getCount(), a.getCount()))
                        .collect(java.util.stream.Collectors.toList()));
            } else {
                // Évolution chronologique
                dto.setEvolution(reponses.stream()
                        .map(r -> new QuestionSyntheseDTO.ReponseParDate(
                                r.getDateReponse().toString(),
                                r.getChoixSelectionne()
                        ))
                        .collect(java.util.stream.Collectors.toList()));
            }
            return dto;
        }).collect(java.util.stream.Collectors.toList());
    }
}