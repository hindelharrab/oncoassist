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

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuestionnaireService {

    private final QuestionnaireSuiviRepository questionRepo;
    private final PatientRepository patientRepo;
    private final MedecinRepository medecinRepo;
    private final AttributionQuestionnaireRepository attributionRepo;

    // GET questions globales
    public List<QuestionSuiviResponseDTO> getQuestionsGlobales() {
        return questionRepo.findByPatientIsNullOrderByOrdre()
                .stream()
                .map(q -> toDTO(q, true))
                .toList();
    }

    // GET questions pour un patient (globales + custom)
    public List<QuestionSuiviResponseDTO> getQuestionsForPatient(UUID patientId) {
        List<QuestionnaireSuivi> globales =
                questionRepo.findByPatientIsNullOrderByOrdre();
        List<QuestionnaireSuivi> custom =
                questionRepo.findByPatientIdOrderByOrdre(patientId);

        List<QuestionSuiviResponseDTO> result = new ArrayList<>();
        for (QuestionnaireSuivi q : globales) result.add(toDTO(q, true));
        for (QuestionnaireSuivi q : custom) result.add(toDTO(q, false));
        return result;
    }

    // POST ajouter question globale
    public QuestionSuiviResponseDTO ajouterQuestionGlobale(
            QuestionSuiviRequestDTO dto) {
        QuestionnaireSuivi q = new QuestionnaireSuivi();
        q.setTexte(dto.getTexte());
        q.setChoix(dto.getChoix());
        q.setOrdre(dto.getOrdre() != null ? dto.getOrdre() : 0);
        q.setPatient(null);
        questionRepo.save(q);
        return toDTO(q, true);
    }

    // POST ajouter question custom pour un patient
    public QuestionSuiviResponseDTO ajouterQuestionCustom(
            UUID patientId, QuestionSuiviRequestDTO dto) {
        Patient patient = patientRepo.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
        QuestionnaireSuivi q = new QuestionnaireSuivi();
        q.setTexte(dto.getTexte());
        q.setChoix(dto.getChoix());
        q.setOrdre(dto.getOrdre() != null ? dto.getOrdre() : 0);
        q.setPatient(patient);
        questionRepo.save(q);
        return toDTO(q, false);
    }

    // DELETE supprimer une question
    public void supprimerQuestion(UUID questionId) {
        questionRepo.deleteById(questionId);
    }

    // POST attribuer questionnaire
    public void attribuerQuestionnaire(AttributionRequestDTO dto) {
        Patient patient = patientRepo.findById(dto.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
        Medecin medecin = medecinRepo.findById(dto.getMedecinId())
                .orElseThrow(() -> new RuntimeException("Médecin non trouvé"));

        AttributionQuestionnaire attribution = new AttributionQuestionnaire();
        attribution.setPatient(patient);
        attribution.setMedecin(medecin);
        attribution.setFrequence(dto.getFrequence());
        attribution.setDateDebut(LocalDate.now());
        attribution.setDateFin(dto.getDateFin());
        attribution.setActif(true);
        attributionRepo.save(attribution);
    }

    // Helper mapper
    private QuestionSuiviResponseDTO toDTO(QuestionnaireSuivi q, boolean globale) {
        QuestionSuiviResponseDTO dto = new QuestionSuiviResponseDTO();
        dto.setId(q.getId());
        dto.setTexte(q.getTexte());
        dto.setChoix(q.getChoix());
        dto.setOrdre(q.getOrdre());
        dto.setGlobale(globale);
        return dto;
    }
}