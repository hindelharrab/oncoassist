package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.PlanTraitement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PlanTraitementRepository extends JpaRepository<PlanTraitement, UUID> {

    List<PlanTraitement> findByDossierMedicalIdOrderByDateConsultationAsc(UUID dossierId);
}

