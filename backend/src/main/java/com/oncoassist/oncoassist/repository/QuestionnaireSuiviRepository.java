package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.QuestionnaireSuivi;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface QuestionnaireSuiviRepository
        extends JpaRepository<QuestionnaireSuivi, UUID> {

    List<QuestionnaireSuivi> findByPatientIsNullOrderByOrdre();

    List<QuestionnaireSuivi> findByPatientIdOrderByOrdre(UUID patientId);
}