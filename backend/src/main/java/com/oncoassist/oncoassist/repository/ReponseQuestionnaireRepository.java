package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.ReponseQuestionnaire;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReponseQuestionnaireRepository
        extends JpaRepository<ReponseQuestionnaire, UUID> {

    // Toutes les réponses d'un patient
    List<ReponseQuestionnaire> findByPatientIdOrderByDateReponse(UUID patientId);

    // Réponses d'un patient pour une question précise
    // → pour afficher l'évolution dans le graphique
    List<ReponseQuestionnaire> findByPatientIdAndQuestionIdOrderByDateReponse(
            UUID patientId, UUID questionId);

    // Toutes les réponses d'une attribution
    List<ReponseQuestionnaire> findByAttributionIdOrderByDateReponse(UUID attributionId);
}