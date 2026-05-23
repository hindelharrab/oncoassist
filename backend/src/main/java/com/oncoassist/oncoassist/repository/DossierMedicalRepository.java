package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.DossierMedical;
import com.oncoassist.oncoassist.model.entity.enums.StatutDossierEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DossierMedicalRepository extends JpaRepository<DossierMedical, UUID> {
    Optional<DossierMedical> findByPatientId(UUID patientId);
    long countByStatut(StatutDossierEnum statut);

    @Query("""
    SELECT COUNT(d) FROM DossierMedical d
    WHERE d.dateCreation >= :from AND d.dateCreation < :to
      AND d.statut = :statut
""")
    long countByStatutAndPeriod(
            @Param("statut") StatutDossierEnum statut,
            @Param("from")   LocalDate from,
            @Param("to") LocalDate to
    );

    // Dossiers par mois (actifs + archives) pour le chart
    @Query("""
    SELECT MONTH(d.dateCreation), d.statut, COUNT(d)
    FROM DossierMedical d
    WHERE d.dateCreation >= :from
    GROUP BY MONTH(d.dateCreation), d.statut
    ORDER BY MONTH(d.dateCreation)
""")
    List<Object[]> countByMonthAndStatut(@Param("from") LocalDate from);

    // % dossiers avec au moins un examen
    @Query("""
    SELECT COUNT(DISTINCT d.id) FROM DossierMedical d
    WHERE SIZE(d.examens) > 0
""")
    long countWithExamen();

}