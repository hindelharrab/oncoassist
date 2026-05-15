package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.Resultat;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface ResultatRepository extends JpaRepository<Resultat, UUID> {
    Optional<Resultat> findByExamenId(UUID examenId);
}