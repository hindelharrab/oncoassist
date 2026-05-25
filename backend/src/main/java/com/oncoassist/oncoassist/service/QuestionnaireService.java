package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.AttributionRequestDTO;
import com.oncoassist.oncoassist.model.dto.QuestionSuiviRequestDTO;
import com.oncoassist.oncoassist.model.dto.QuestionSuiviResponseDTO;
import com.oncoassist.oncoassist.model.entity.AttributionQuestionnaire;
import com.oncoassist.oncoassist.model.entity.Medecin;
import com.oncoassist.oncoassist.model.entity.Patient;
import com.oncoassist.oncoassist.model.entity.QuestionnaireSuivi;
import com.oncoassist.oncoassist.repository.AttributionQuestionnaireRepository;
import com.oncoassist.oncoassist.repository.MedecinRepository;
import com.oncoassist.oncoassist.repository.PatientRepository;
import com.oncoassist.oncoassist.repository.QuestionnaireSuiviRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuestionnaireService {

    private final QuestionnaireSuiviRepository questionRepo;
    private final PatientRepository            patientRepo;
    private final MedecinRepository            medecinRepo;
    private final AttributionQuestionnaireRepository attributionRepo;

    // GET questions globales
    @Transactional(readOnly = true)
    public List<QuestionSuiviResponseDTO> getQuestionsGlobales() {
        return questionRepo.findByPatientIsNullOrderByOrdre()
                .stream()
                .map(q -> toDTO(q, true))
                .toList();
    }

    // GET questions pour un patient (globales + custom)
    @Transactional(readOnly = true)
    public List<QuestionSuiviResponseDTO> getQuestionsForPatient(
            UUID patientId) {
        List<QuestionnaireSuivi> globales =
                questionRepo.findByPatientIsNullOrderByOrdre();
        List<QuestionnaireSuivi> custom =
                questionRepo.findByPatientIdOrderByOrdre(patientId);

        List<QuestionSuiviResponseDTO> result = new ArrayList<>();
        globales.forEach(q -> result.add(toDTO(q, true)));
        custom.forEach(q -> result.add(toDTO(q, false)));
        return result;
    }

    // POST ajouter question globale
    @Transactional
    public QuestionSuiviResponseDTO ajouterQuestionGlobale(
            QuestionSuiviRequestDTO dto) {
        QuestionnaireSuivi q = new QuestionnaireSuivi();
        q.setTexte(dto.getTexte());
        q.setChoix(dto.getChoix() != null
                ? new ArrayList<>(dto.getChoix())
                : new ArrayList<>());
        q.setOrdre(dto.getOrdre() != null ? dto.getOrdre() : 0);
        q.setPatient(null);
        QuestionnaireSuivi saved = questionRepo.save(q);
        return toDTO(saved, true);
    }

    // POST ajouter question custom pour un patient
    @Transactional
    public QuestionSuiviResponseDTO ajouterQuestionCustom(
            UUID patientId, QuestionSuiviRequestDTO dto) {
        Patient patient = patientRepo.findById(patientId)
                .orElseThrow(() ->
                        new RuntimeException("Patient non trouvé")
                );
        QuestionnaireSuivi q = new QuestionnaireSuivi();
        q.setTexte(dto.getTexte());
        q.setChoix(dto.getChoix() != null
                ? new ArrayList<>(dto.getChoix())
                : new ArrayList<>());
        q.setOrdre(dto.getOrdre() != null ? dto.getOrdre() : 0);
        q.setPatient(patient);
        QuestionnaireSuivi saved = questionRepo.save(q);
        return toDTO(saved, false);
    }

    // DELETE supprimer une question
    @Transactional
    public void supprimerQuestion(UUID questionId) {
        questionRepo.deleteById(questionId);
    }

    // POST attribuer questionnaire
    @Transactional
    public void attribuerQuestionnaire(AttributionRequestDTO dto) {
        Patient patient = patientRepo.findById(dto.getPatientId())
                .orElseThrow(() ->
                        new RuntimeException("Patient non trouvé")
                );
        Medecin medecin = medecinRepo.findById(dto.getMedecinId())
                .orElseThrow(() ->
                        new RuntimeException("Médecin non trouvé")
                );

        AttributionQuestionnaire attribution =
                new AttributionQuestionnaire();
        attribution.setPatient(patient);
        attribution.setMedecin(medecin);
        attribution.setFrequence(dto.getFrequence());
        attribution.setDateDebut(LocalDate.now());
        attribution.setDateFin(dto.getDateFin());
        attribution.setActif(true);
        attributionRepo.save(attribution);
    }

    // ── Mapper ────────────────────────────────────
    private QuestionSuiviResponseDTO toDTO(
            QuestionnaireSuivi q, boolean globale) {
        QuestionSuiviResponseDTO dto =
                new QuestionSuiviResponseDTO();
        dto.setId(q.getId());
        dto.setTexte(q.getTexte());
        dto.setOrdre(q.getOrdre());
        dto.setGlobale(globale);

        // Force le chargement de la collection
        // DANS la transaction avant sérialisation Jackson
        dto.setChoix(
                q.getChoix() != null
                        ? new ArrayList<>(q.getChoix())
                        : new ArrayList<>()
        );

        return dto;
    }
}