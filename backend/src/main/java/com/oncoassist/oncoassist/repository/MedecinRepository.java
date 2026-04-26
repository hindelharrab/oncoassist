package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.Medecin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MedecinRepository extends JpaRepository<Medecin, UUID> {
    boolean existsByEmail(String email);
    boolean existsByNumeroOrdre(String numeroOrdre);
    List<Medecin> findBySpecialiteId(UUID specialiteId);
}