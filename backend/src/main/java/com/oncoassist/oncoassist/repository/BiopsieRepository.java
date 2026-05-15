// BiopsieRepository.java
package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.Biopsie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface BiopsieRepository extends JpaRepository<Biopsie, UUID> {

    // ✅ Chercher par patientId directement
    @Query("SELECT b FROM Biopsie b WHERE b.dossierMedical.patient.id = :patientId ORDER BY b.date DESC")
    List<Biopsie> findByPatientId(@Param("patientId") UUID patientId);

    // Garder aussi par dossierId si besoin
    @Query("SELECT b FROM Biopsie b WHERE b.dossierMedical.id = :dossierId ORDER BY b.date DESC")
    List<Biopsie> findByDossierMedicalId(@Param("dossierId") UUID dossierId);
}