package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.Echographie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface EchographieRepository extends JpaRepository<Echographie, UUID> {

    @Query("SELECT e FROM Echographie e WHERE e.dossierMedical.id = :dossierId ORDER BY e.date DESC")
    List<Echographie> findByDossierMedicalIdOrderByDateDesc(@Param("dossierId") UUID dossierId);

    long countByDateBetween(LocalDateTime start, LocalDateTime end);

    List<Echographie> findTop5ByOrderByDateDesc();
}