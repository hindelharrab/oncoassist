package com.oncoassist.oncoassist.model.entity;

import com.oncoassist.oncoassist.model.entity.enums.LienFamilialEnum;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "antecedents_familiaux")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = "dossierMedical")

public class AntecedentFamilial {

    @Id
    @GeneratedValue
    @EqualsAndHashCode.Include
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "lien_familial", nullable = false)
    private LienFamilialEnum lienFamilial;

    @Column(nullable = false)
    private String maladie;

    @Column(name = "age_survenue")
    private String ageSurvenue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_id", nullable = false)
    private DossierMedical dossierMedical;
}