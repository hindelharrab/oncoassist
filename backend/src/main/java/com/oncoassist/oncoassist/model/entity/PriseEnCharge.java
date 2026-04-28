package com.oncoassist.oncoassist.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.oncoassist.oncoassist.model.entity.enums.RolePECEnum;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "prises_en_charge")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"medecin", "patient"})

public class PriseEnCharge {

    @Id
    @GeneratedValue
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RolePECEnum role = RolePECEnum.REFERENT;

    @Column(name = "motif_transfert", columnDefinition = "TEXT")
    private String motifTransfert;

    @Column(name = "acces_ecriture", nullable = false)
    private Boolean accesEcriture = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "medecin_id", nullable = false)
    private Medecin medecin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;
}