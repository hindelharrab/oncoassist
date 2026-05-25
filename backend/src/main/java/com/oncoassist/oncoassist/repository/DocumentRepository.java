package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.Document;
import com.oncoassist.oncoassist.model.entity.enums.DocTypeEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


public interface DocumentRepository extends JpaRepository<Document, UUID> {

    @Query("SELECT d FROM Document d WHERE d.dossierMedical.id = :dossierId ORDER BY d.dateAjout DESC")
    List<Document> findByDossierMedicalIdOrderByDateDesc(@Param("dossierId") UUID dossierId);

    @Query("SELECT d FROM Document d WHERE d.dossierMedical.id = :dossierId AND d.type = :type ORDER BY d.dateAjout DESC")
    List<Document> findByDossierMedicalIdAndType(
            @Param("dossierId") UUID dossierId,
            @Param("type") DocTypeEnum type
    );

    // ── NOUVEAU : tous les résultats d'examens (multi-types) ──
    @Query("SELECT d FROM Document d WHERE d.dossierMedical.id = :dossierId AND d.type IN :types ORDER BY d.dateAjout DESC")
    List<Document> findByDossierMedicalIdAndTypeIn(
            @Param("dossierId") UUID dossierId,
            @Param("types") List<DocTypeEnum> types
    );

    // ── NOUVEAU : vérifier si un résultat existe déjà pour un examen ──
    Optional<Document> findByExamenSourceId(UUID examenSourceId);
    boolean existsByDossierMedicalIdAndType(UUID dossierMedicalId, DocTypeEnum type);

    Optional<Document> findTopByDossierMedicalIdOrderByDateAjoutDesc(UUID dossierMedicalId);

    Optional<Document> findTopByDossierMedical_Patient_IdAndTypeOrderByDateAjoutDesc(UUID patientId, DocTypeEnum type);
}