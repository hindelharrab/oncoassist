package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {
    boolean existsByEmail(String email);
    List<Patient> findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(String nom, String prenom);

    @Query("SELECT DISTINCT p FROM Patient p JOIN p.prisesEnCharge pec WHERE pec.medecin.id = :medecinId AND pec.dateFin IS NULL")
    List<Patient> findByMedecinActif(@Param("medecinId") UUID medecinId);
    // Tranches d'âge
    @Query("""
    SELECT COUNT(p) FROM Patient p
    WHERE p.dateNaissance IS NOT NULL
      AND YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) < 18
""")
    long countEnfants();

    @Query("""
    SELECT COUNT(p) FROM Patient p
    WHERE p.dateNaissance IS NOT NULL
      AND YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) BETWEEN 18 AND 64
""")
    long countAdultes();

    @Query("""
    SELECT COUNT(p) FROM Patient p
    WHERE p.dateNaissance IS NOT NULL
      AND YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) >= 65
""")
    long countSeniors();

    // Nouveaux patients créés entre deux dates
// Patient étend Utilisateur — adapte selon ton champ dateCreation
    @Query("""
    SELECT COUNT(u) FROM Utilisateur u
    WHERE TYPE(u) = Patient
      AND u.dateCreation >= :from
      AND u.dateCreation < :to
""")
    long countCreatedBetween(
            @Param("from") LocalDateTime from,
            @Param("to")   LocalDateTime to
    );



}