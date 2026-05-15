package com.oncoassist.oncoassist.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "plans_traitement")

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"dossierMedical", "auteur"})

public class PlanTraitement {

    @Id
    @GeneratedValue
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(name = "date_consultation", nullable = false)
    private LocalDate dateConsultation;

    // Type de séance : "Examen manuel", "IRM", "Échographie", "Biopsie"...
    @Column(name = "etape")
    private String etape;

    // "fait" ou "à venir"
    @Column(name = "statut")
    private String statut = "fait";

    // Visible par le patient ?
    @Column(name = "visible_patient", nullable = false)
    private Boolean visiblePatient = false;

    // Prochaine étape planifiée — reste ici car utile pour la timeline
    @Column(name = "prochaine_etape")
    private String prochaineEtape;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_id", nullable = false)
    private DossierMedical dossierMedical;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auteur_id", nullable = false)
    private Medecin auteur;
}