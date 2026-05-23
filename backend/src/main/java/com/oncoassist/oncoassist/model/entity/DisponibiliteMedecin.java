package com.oncoassist.oncoassist.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "disponibilites_medecin",
        uniqueConstraints = @UniqueConstraint(columnNames = {"medecin_id", "jour"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class DisponibiliteMedecin {

    @Id
    @GeneratedValue
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_id", nullable = false)
    private Medecin medecin;

    @Column(nullable = false)
    private String jour;        // "MONDAY", "TUESDAY", ...

    @Column(name = "heure_debut", nullable = false)
    private String heureDebut;  // "09:00"

    @Column(name = "heure_fin", nullable = false)
    private String heureFin;    // "17:00"
}