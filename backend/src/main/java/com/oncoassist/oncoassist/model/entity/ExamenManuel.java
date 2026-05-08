package com.oncoassist.oncoassist.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "examens_manuels")
@DiscriminatorValue("MANUEL")

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)

public class ExamenManuel extends Examen {

    @Column(name = "masse_palpee", nullable = false)
    private Boolean massePalpee = false;

    @Column(name = "localisation_de_masse")
    private String localisationDeMasse;

    // ── Champs ajoutés pour la page Consultation ──────────────
    // aspect de la peau : Normal, Rougeur, Capitons
    @Column(name = "aspect_peau")
    private String aspectPeau;

    // adénopathies : Oui / Non
    @Column(name = "adenopathies")
    private String adenopathies;

    // description / conclusions cliniques (textarea du front)
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // notes cliniques générales (textarea "Notes Cliniques" du front)
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}