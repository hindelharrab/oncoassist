package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.AttributionQuestionnaire;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AttributionQuestionnaireRepository
        extends JpaRepository<AttributionQuestionnaire, UUID> {

    List<AttributionQuestionnaire> findByPatientId(UUID patientId);

    List<AttributionQuestionnaire> findByMedecinId(UUID medecinId);

    boolean existsByPatientIdAndActifTrue(UUID patientId);
}