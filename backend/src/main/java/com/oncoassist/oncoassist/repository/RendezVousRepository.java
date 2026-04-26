package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.RendezVous;
import com.oncoassist.oncoassist.model.entity.enums.StatutRDVEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RendezVousRepository extends JpaRepository<RendezVous, UUID> {
    List<RendezVous> findByPatientId(UUID patientId);
    List<RendezVous> findByMedecinId(UUID medecinId);
    List<RendezVous> findByStatut(StatutRDVEnum statut);
    List<RendezVous> findBySecretaireId(UUID secretaireId);
}