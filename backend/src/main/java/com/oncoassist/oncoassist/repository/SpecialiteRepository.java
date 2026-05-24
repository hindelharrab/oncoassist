package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.Specialite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpecialiteRepository extends JpaRepository<Specialite, UUID> {

    boolean existsByNom(String nom);

    // ── Pour la liste ─────────────────────────────────────────────────────────
    @Query("SELECT DISTINCT s FROM Specialite s LEFT JOIN FETCH s.medecins")
    List<Specialite> findAllWithMedecins();

    @Query("SELECT DISTINCT s FROM Specialite s LEFT JOIN FETCH s.secretaires")
    List<Specialite> findAllWithSecretaires();

    // ── Pour le détail ────────────────────────────────────────────────────────
    @Query("""
        SELECT DISTINCT s FROM Specialite s
        LEFT JOIN FETCH s.medecins m
        LEFT JOIN FETCH m.rendezVous r
        LEFT JOIN FETCH r.patient
        WHERE s.id = :id
    """)
    Optional<Specialite> findByIdWithMedecinsAndRdv(@Param("id") UUID id);

    @Query("""
        SELECT DISTINCT s FROM Specialite s
        LEFT JOIN FETCH s.medecins m
        LEFT JOIN FETCH m.prisesEnCharge pec
        LEFT JOIN FETCH pec.patient
        WHERE s.id = :id
    """)
    Optional<Specialite> findByIdWithMedecinsAndPec(@Param("id") UUID id);

    @Query("""
        SELECT DISTINCT s FROM Specialite s
        LEFT JOIN FETCH s.secretaires
        WHERE s.id = :id
    """)
    Optional<Specialite> findByIdWithSecretaires(@Param("id") UUID id);

    // ── Comptage direct en SQL — patients distincts d'une spécialité ──────────
    // Patient est pris en charge par un médecin qui a cette spécialité
    @Query("""
        SELECT COUNT(DISTINCT pec.patient.id)
        FROM PriseEnCharge pec
        WHERE pec.medecin.specialite.id = :specialiteId
    """)
    long countPatientsBySpecialite(@Param("specialiteId") UUID specialiteId);

    // ── Comptage direct — total RDV des médecins de cette spécialité ──────────
    @Query("""
        SELECT COUNT(r)
        FROM RendezVous r
        WHERE r.medecin.specialite.id = :specialiteId
    """)
    long countRdvBySpecialite(@Param("specialiteId") UUID specialiteId);

    // ── RDV du mois courant ───────────────────────────────────────────────────
    @Query("""
        SELECT COUNT(r)
        FROM RendezVous r
        WHERE r.medecin.specialite.id = :specialiteId
        AND r.date >= :debut
    """)
    long countRdvMoisBySpecialite(
            @Param("specialiteId") UUID specialiteId,
            @Param("debut") LocalDateTime debut);

    // ── Patients par médecin ──────────────────────────────────────────────────
    @Query("""
        SELECT COUNT(DISTINCT pec.patient.id)
        FROM PriseEnCharge pec
        WHERE pec.medecin.id = :medecinId
    """)
    long countPatientsByMedecin(@Param("medecinId") UUID medecinId);

    // ── RDV par médecin ───────────────────────────────────────────────────────
    @Query("""
        SELECT COUNT(r)
        FROM RendezVous r
        WHERE r.medecin.id = :medecinId
    """)
    long countRdvByMedecin(@Param("medecinId") UUID medecinId);
}