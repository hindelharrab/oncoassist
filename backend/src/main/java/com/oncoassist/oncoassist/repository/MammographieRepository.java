package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.Mammographie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MammographieRepository
        extends JpaRepository<Mammographie, UUID> {

    List<Mammographie> findByDossierMedicalId(UUID dossierId);
}