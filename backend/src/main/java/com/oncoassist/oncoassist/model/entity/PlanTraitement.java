package com.oncoassist.oncoassist.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "plans_traitement")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"dossierMedical", "auteur"})

public class PlanTraitement {

    @Id
    @GeneratedValue
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(name = "date_consultation", nullable = false)
    private LocalDate dateConsultation;

    @Column(columnDefinition = "TEXT")
    private String prescription;

    @Column(name = "examens_complementaires", columnDefinition = "TEXT")
    private String examensComplementaires;

    @Column(columnDefinition = "TEXT")
    private String recommandations;

    @Column(name = "visible_patient", nullable = false)
    private Boolean visiblePatient = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_id", nullable = false)
    private DossierMedical dossierMedical;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auteur_id", nullable = false)
    private Medecin auteur;
}