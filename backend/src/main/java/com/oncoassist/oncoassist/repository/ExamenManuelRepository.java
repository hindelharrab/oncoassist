package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.ExamenManuel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface ExamenManuelRepository extends JpaRepository<ExamenManuel, UUID> {

    @Query("SELECT e FROM ExamenManuel e WHERE e.dossierMedical.id = :dossierId ORDER BY e.date DESC")
    List<ExamenManuel> findByDossierMedicalIdOrderByDateDesc(@Param("dossierId") UUID dossierId);
}