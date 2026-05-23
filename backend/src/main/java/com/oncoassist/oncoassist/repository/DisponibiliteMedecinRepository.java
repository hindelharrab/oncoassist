package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.DisponibiliteMedecin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface DisponibiliteMedecinRepository extends JpaRepository<DisponibiliteMedecin, UUID> {
    List<DisponibiliteMedecin> findByMedecinId(UUID medecinId);
    void deleteByMedecinId(UUID medecinId);
}