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
    // Spark : count par jour sur les N derniers jours
    @Query("""
    SELECT CAST(r.date AS date), COUNT(r)
    FROM RendezVous r
    WHERE r.date >= :from
    GROUP BY CAST(r.date AS date)
    ORDER BY CAST(r.date AS date)
""")
    List<Object[]> countByDay(@Param("from") LocalDateTime from);

    // RDV par mois + statut (pour le chart mensuel)
    @Query("""
    SELECT MONTH(r.date), r.statut, COUNT(r)
    FROM RendezVous r
    WHERE r.date >= :from AND r.date < :to
    GROUP BY MONTH(r.date), r.statut
    ORDER BY MONTH(r.date)
""")
    List<Object[]> countByMonthAndStatut(
            @Param("from") LocalDateTime from,
            @Param("to")   LocalDateTime to
    );

    // Patients suivis par médecin (actifs)
    @Query("""
    SELECT r.medecin.id, COUNT(DISTINCT r.patient.id)
    FROM RendezVous r
    GROUP BY r.medecin.id
""")
    List<Object[]> countPatientsByMedecin();

    // RDV d'un médecin sur un mois donné
    @Query("""
    SELECT COUNT(r) FROM RendezVous r
    WHERE r.medecin.id = :medecinId
      AND MONTH(r.date) = :month
      AND YEAR(r.date)  = :year
""")
    long countByMedecinAndMonth(
            @Param("medecinId") UUID medecinId,
            @Param("month")     int month,
            @Param("year")      int year
    );

    // RDV gérés par secrétaire ce mois
    @Query("""
    SELECT r.secretaire.id, r.statut, COUNT(r)
    FROM RendezVous r
    WHERE r.secretaire IS NOT NULL
      AND r.date >= :from AND r.date < :to
    GROUP BY r.secretaire.id, r.statut
""")
    List<Object[]> countBySecretaireAndStatutThisMonth(
            @Param("from") LocalDateTime from,
            @Param("to")   LocalDateTime to
    );

    // Nouveaux patients par semaine (7 dernières semaines)
    @Query("""
    SELECT WEEK(r.date), COUNT(DISTINCT r.patient.id)
    FROM RendezVous r
    WHERE r.date >= :from
    GROUP BY WEEK(r.date)
    ORDER BY WEEK(r.date)
""")
    List<Object[]> countNewPatientsByWeek(@Param("from") LocalDateTime from);

    @Query("""
    SELECT r FROM RendezVous r
    LEFT JOIN FETCH r.patient
    LEFT JOIN FETCH r.medecin
    LEFT JOIN FETCH r.secretaire
    WHERE r.date >= :from AND r.date < :to
    ORDER BY r.date ASC
""")
    List<RendezVous> findByPeriodWithDetails(
            @Param("from") LocalDateTime from,
            @Param("to")   LocalDateTime to
    );

    @Query("""
    SELECT r FROM RendezVous r
    LEFT JOIN FETCH r.patient
    LEFT JOIN FETCH r.medecin
    LEFT JOIN FETCH r.secretaire
    WHERE r.medecin.id = :medecinId
      AND r.date >= :from AND r.date < :to
    ORDER BY r.date ASC
""")
    List<RendezVous> findByMedecinAndPeriodWithDetails(
            @Param("medecinId") UUID medecinId,
            @Param("from")      LocalDateTime from,
            @Param("to")        LocalDateTime to
    );
}
