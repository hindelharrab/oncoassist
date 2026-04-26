package com.oncoassist.oncoassist.model.entity;

import com.oncoassist.oncoassist.model.entity.enums.StatutAntecEnum;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "antecedents_medicaux")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = "dossierMedical")

public class AntecedentMedical {

    @Id
    @GeneratedValue
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(nullable = false)
    private String maladie;

    @Column(name = "date_diagnostic")
    private LocalDate dateDiagnostic;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutAntecEnum statut;

    private String traitements;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_id", nullable = false)
    private DossierMedical dossierMedical;
}