package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.PriseEnCharge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PriseEnChargeRepository extends JpaRepository<PriseEnCharge, UUID> {
    List<PriseEnCharge> findByPatientId(UUID patientId);
    List<PriseEnCharge> findByMedecinId(UUID medecinId);
    boolean existsByPatientIdAndMedecinIdAndDateFinIsNull(UUID patientId, UUID medecinId);
}