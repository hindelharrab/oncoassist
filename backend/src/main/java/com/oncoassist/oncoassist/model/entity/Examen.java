package com.oncoassist.oncoassist.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "examens")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "type_examen", discriminatorType = DiscriminatorType.STRING)

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"auteur", "dossierMedical", "resultat"})

public abstract class Examen {

    @Id
    @GeneratedValue
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(nullable = false)
    private LocalDateTime date;

    @Column(name = "site_anatomique")
    private String siteAnatomique;

    @Column(name = "visible_patient", nullable = false)
    private Boolean visiblePatient = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auteur_id", nullable = false)
    private Medecin auteur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_id", nullable = false)
    private DossierMedical dossierMedical;

    @OneToOne(mappedBy = "examen", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Resultat resultat;
}