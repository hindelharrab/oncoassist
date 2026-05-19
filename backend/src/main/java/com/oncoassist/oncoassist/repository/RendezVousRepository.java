package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.RendezVous;
import com.oncoassist.oncoassist.model.entity.enums.StatutRDVEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface RendezVousRepository extends JpaRepository<RendezVous, UUID> {
    List<RendezVous> findByPatientId(UUID patientId);
    List<RendezVous> findByMedecinId(UUID medecinId);
    List<RendezVous> findByStatut(StatutRDVEnum statut);
    List<RendezVous> findBySecretaireId(UUID secretaireId);
    List<RendezVous> findByPatientIdAndDateAfterOrderByDateAsc(UUID patientId, LocalDateTime after);

    // Dashboard
    long countByMedecinIdAndDateBetween(UUID medecinId, LocalDateTime start, LocalDateTime end);
    List<RendezVous> findByMedecinIdAndDateBetween(UUID medecinId, LocalDateTime start, LocalDateTime end);
    List<RendezVous> findByPatientIdAndStatutOrderByDateAsc(UUID patientId, StatutRDVEnum statut);
    // RendezVousRepository — remplace la méthode dérivée par :
    @Query("""
    SELECT r FROM RendezVous r
    WHERE r.patient.id = :patientId
      AND r.statut = :statut
    ORDER BY r.date ASC
""")
    List<RendezVous> findRdvByPatientAndStatut(
            @Param("patientId") UUID patientId,
            @Param("statut") StatutRDVEnum statut);
    List<RendezVous> findByPatientIdAndStatut(UUID patientId, StatutRDVEnum statut);
    List<RendezVous> findByDateBetween(LocalDateTime start, LocalDateTime end);
}
