package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.IRM;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface IRMRepository extends JpaRepository<IRM, UUID> {

    @Query("SELECT i FROM IRM i WHERE i.dossierMedical.id = :dossierId ORDER BY i.date DESC")
    List<IRM> findByDossierMedicalIdOrderByDateDesc(@Param("dossierId") UUID dossierId);

    long countByDateBetween(LocalDateTime start, LocalDateTime end);

    List<IRM> findTop5ByOrderByDateDesc();
}