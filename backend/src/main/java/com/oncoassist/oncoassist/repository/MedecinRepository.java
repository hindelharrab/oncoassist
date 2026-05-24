package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.Medecin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MedecinRepository extends JpaRepository<Medecin, UUID> {
    boolean existsByEmail(String email);
    boolean existsByNumeroOrdre(String numeroOrdre);
    List<Medecin> findBySpecialiteId(UUID specialiteId);
    Optional<Medecin> findByEmail(String email);
    // Médecins créés ce mois (via Utilisateur.dateCreation)
    @Query("""
    SELECT COUNT(u) FROM Utilisateur u
    WHERE TYPE(u) = Medecin
      AND u.dateCreation >= :from
      AND u.dateCreation < :to
""")
    long countCreatedBetween(
            @Param("from") LocalDateTime from,
            @Param("to")   LocalDateTime to
    );

    // Médecins groupés par spécialité
    @Query("""
    SELECT m.specialite.nom, COUNT(m)
    FROM Medecin m
    WHERE m.specialite IS NOT NULL
    GROUP BY m.specialite.nom
""")
    List<Object[]> countBySpecialite();

}