package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.DossierMedical;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DossierMedicalRepository extends JpaRepository<DossierMedical, UUID> {
    Optional<DossierMedical> findByPatientId(UUID patientId);
}