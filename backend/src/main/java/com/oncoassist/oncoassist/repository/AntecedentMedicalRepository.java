package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.AntecedentMedical;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AntecedentMedicalRepository extends JpaRepository<AntecedentMedical, UUID> {
    List<AntecedentMedical> findByDossierMedicalId(UUID dossierId);
    void deleteByDossierMedicalId(UUID dossierId);
}
