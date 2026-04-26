package com.oncoassist.oncoassist.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "examens_manuels")
@DiscriminatorValue("MANUEL")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)

public class ExamenManuel extends Examen {

    @Column(name = "masse_palpee", nullable = false)
    private Boolean massePalpee = false;

    @Column(name = "localisation_de_masse")
    private String localisationDeMasse;
}