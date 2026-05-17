package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.Examen;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ExamenRepository extends JpaRepository<Examen, UUID> {

    List<Examen> findByDossierMedicalId(UUID dossierId);
}