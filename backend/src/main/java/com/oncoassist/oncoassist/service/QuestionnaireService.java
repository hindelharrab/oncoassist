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

    @Transactional(readOnly = true)
    public List<QuestionSuiviResponseDTO> getQuestionsGlobales() {
        return questionRepo.findByPatientIsNullOrderByOrdre()
                .stream()
                .map(q -> toDTO(q, true))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<QuestionSuiviResponseDTO> getQuestionsForPatient(UUID patientId) {
        List<QuestionnaireSuivi> globales = questionRepo.findByPatientIsNullOrderByOrdre();
        List<QuestionnaireSuivi> custom   = questionRepo.findByPatientIdOrderByOrdre(patientId);

        List<QuestionSuiviResponseDTO> result = new ArrayList<>();
        globales.forEach(q -> result.add(toDTO(q, true)));
        custom.forEach(q -> result.add(toDTO(q, false)));
        return result;
    }

    @Transactional
    public QuestionSuiviResponseDTO ajouterQuestionGlobale(QuestionSuiviRequestDTO dto) {
        QuestionnaireSuivi q = new QuestionnaireSuivi();
        q.setTexte(dto.getTexte());
        q.setChoix(dto.getChoix() != null ? new ArrayList<>(dto.getChoix()) : new ArrayList<>());
        q.setOrdre(dto.getOrdre() != null ? dto.getOrdre() : 0);
        q.setType(dto.getType() != null ? dto.getType() : "unique");  // ← NOUVEAU
        q.setPatient(null);
        return toDTO(questionRepo.save(q), true);
    }

    @Transactional
    public QuestionSuiviResponseDTO ajouterQuestionCustom(UUID patientId, QuestionSuiviRequestDTO dto) {
        Patient patient = patientRepo.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
        QuestionnaireSuivi q = new QuestionnaireSuivi();
        q.setTexte(dto.getTexte());
        q.setChoix(dto.getChoix() != null ? new ArrayList<>(dto.getChoix()) : new ArrayList<>());
        q.setOrdre(dto.getOrdre() != null ? dto.getOrdre() : 0);
        q.setType(dto.getType() != null ? dto.getType() : "unique");  // ← NOUVEAU
        q.setPatient(patient);
        return toDTO(questionRepo.save(q), false);
    }

    @Transactional
    public QuestionSuiviResponseDTO updateQuestion(UUID id, QuestionSuiviRequestDTO dto) {
        QuestionnaireSuivi q = questionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Question non trouvée"));
        q.setTexte(dto.getTexte());
        q.setChoix(dto.getChoix() != null ? new ArrayList<>(dto.getChoix()) : new ArrayList<>());
        q.setOrdre(dto.getOrdre() != null ? dto.getOrdre() : q.getOrdre());
        q.setType(dto.getType() != null ? dto.getType() : q.getType());  // ← NOUVEAU
        return toDTO(questionRepo.save(q), q.getPatient() == null);
    }

    @Transactional
    public void supprimerQuestion(UUID questionId) {
        questionRepo.deleteById(questionId);
    }

    @Transactional
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

    private QuestionSuiviResponseDTO toDTO(QuestionnaireSuivi q, boolean globale) {
        QuestionSuiviResponseDTO dto = new QuestionSuiviResponseDTO();
        dto.setId(q.getId());
        dto.setTexte(q.getTexte());
        dto.setOrdre(q.getOrdre());
        dto.setGlobale(globale);
        dto.setType(q.getType() != null ? q.getType() : "unique");  // ← NOUVEAU
        dto.setChoix(q.getChoix() != null ? new ArrayList<>(q.getChoix()) : new ArrayList<>());
        return dto;
    }
}