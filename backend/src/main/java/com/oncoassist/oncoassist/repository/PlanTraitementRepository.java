package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.PlanTraitement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface PlanTraitementRepository extends JpaRepository<PlanTraitement, UUID> {

    @Query("SELECT p FROM PlanTraitement p WHERE p.dossierMedical.id = :dossierId ORDER BY p.dateConsultation DESC")
    List<PlanTraitement> findByDossierMedicalIdOrderByDateDesc(@Param("dossierId") UUID dossierId);
}