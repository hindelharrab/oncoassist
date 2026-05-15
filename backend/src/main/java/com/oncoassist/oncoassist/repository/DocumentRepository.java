package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.Document;
import com.oncoassist.oncoassist.model.entity.enums.DocTypeEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {

    // Tous les documents d'un dossier
    @Query("SELECT d FROM Document d WHERE d.dossierMedical.id = :dossierId ORDER BY d.dateAjout DESC")
    List<Document> findByDossierMedicalIdOrderByDateDesc(@Param("dossierId") UUID dossierId);

    // Documents par type (ORDONNANCE, RESULTAT, etc.)
    @Query("SELECT d FROM Document d WHERE d.dossierMedical.id = :dossierId AND d.type = :type ORDER BY d.dateAjout DESC")
    List<Document> findByDossierMedicalIdAndType(
            @Param("dossierId") UUID dossierId,
            @Param("type") DocTypeEnum type
    );
}