package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.Secretaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SecretaireRepository extends JpaRepository<Secretaire, UUID> {

    boolean existsByEmail(String email);

    List<Secretaire> findBySpecialiteId(UUID specialiteId);

    // ── Charge les RDV + patient en une seule requête ──────────────────
    @Query("""
        SELECT DISTINCT s FROM Secretaire s
        LEFT JOIN FETCH s.rendezVousGeres r
        LEFT JOIN FETCH r.patient
        LEFT JOIN FETCH s.specialite
        WHERE s.id = :id
    """)
    Optional<Secretaire> findByIdWithRdv(@Param("id") UUID id);

    // ── Pour la liste : charge seulement la spécialité ─────────────────
    @Query("""
        SELECT DISTINCT s FROM Secretaire s
        LEFT JOIN FETCH s.specialite
        LEFT JOIN FETCH s.rendezVousGeres
    """)
    List<Secretaire> findAllWithRdv();
    Optional<Secretaire> findByEmail(String email);

}