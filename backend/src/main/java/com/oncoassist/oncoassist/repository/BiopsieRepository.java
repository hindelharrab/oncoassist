package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.Biopsie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface BiopsieRepository extends JpaRepository<Biopsie, UUID> {

    @Query("SELECT b FROM Biopsie b WHERE b.dossierMedical.patient.id = :patientId ORDER BY b.date DESC")
    List<Biopsie> findByPatientId(@Param("patientId") UUID patientId);

    @Query("SELECT b FROM Biopsie b WHERE b.dossierMedical.id = :dossierId ORDER BY b.date DESC")
    List<Biopsie> findByDossierMedicalId(@Param("dossierId") UUID dossierId);

    long countByDateBetween(LocalDateTime start, LocalDateTime end);

    List<Biopsie> findTop5ByOrderByDateDesc();
}