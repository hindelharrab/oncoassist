package com.oncoassist.oncoassist.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "resultats")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"examen", "auteur"})

public class Resultat {

    @Id
    @GeneratedValue
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String interpretation;

    @Column(columnDefinition = "TEXT")
    private String conclusion;

    @Column(name = "date_redaction", nullable = false)
    private LocalDate dateRedaction;

    @Column(name = "visible_patient", nullable = false)
    private Boolean visiblePatient = false;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "examen_id", nullable = false, unique = true)
    private Examen examen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auteur_id", nullable = false)
    private Medecin auteur;
}