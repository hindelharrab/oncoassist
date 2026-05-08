package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.AntecedentFamilial;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AntecedentFamilialRepository extends JpaRepository<AntecedentFamilial, UUID> {
    List<AntecedentFamilial> findByDossierMedicalId(UUID dossierId);
    void deleteByDossierMedicalId(UUID dossierId);
}