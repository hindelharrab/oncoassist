package com.oncoassist.oncoassist.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "irms")
@DiscriminatorValue("IRM")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)

public class IRM extends Examen {

    @Column(name = "fichier_image", nullable = false)
    private String fichierImage;

    private String sequences;

    @Column(name = "produit_contraste", nullable = false)
    private Boolean produitContraste = false;
}