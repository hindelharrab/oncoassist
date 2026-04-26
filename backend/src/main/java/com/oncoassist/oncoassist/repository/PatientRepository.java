package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {
    boolean existsByEmail(String email);
    List<Patient> findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(String nom, String prenom);

    @Query("SELECT DISTINCT p FROM Patient p JOIN p.prisesEnCharge pec WHERE pec.medecin.id = :medecinId AND pec.dateFin IS NULL")
    List<Patient> findByMedecinActif(@Param("medecinId") UUID medecinId);
}