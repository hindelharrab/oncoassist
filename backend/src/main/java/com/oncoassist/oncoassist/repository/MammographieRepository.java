package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.Mammographie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface MammographieRepository
        extends JpaRepository<Mammographie, UUID> {

    List<Mammographie> findByDossierMedicalId(UUID dossierId);

    // Pour les KPI
    long countByDateBetween(LocalDateTime start, LocalDateTime end);

    // Pour les examens récents
    List<Mammographie> findTop5ByOrderByDateDesc();

    // Pour la répartition BI-RADS
    @Query("SELECT m.scoreBIRADS, COUNT(m) FROM Mammographie m WHERE m.scoreBIRADS IS NOT NULL GROUP BY m.scoreBIRADS")
    List<Object[]> getBiradsDistribution();
}