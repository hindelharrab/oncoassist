package com.oncoassist.oncoassist.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "medecins")
@DiscriminatorValue("MEDECIN")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(exclude = {"prisesEnCharge", "rendezVous", "attributions", "documents"})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Medecin extends Utilisateur {

    @Column(name = "numero_ordre", unique = true, nullable = false)
    private String numeroOrdre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialite_id")
    @JsonIgnoreProperties({"secretaires", "hibernateLazyInitializer"})
    private Specialite specialite;


    // ── Relations ────────────────────────────────────────────
    @OneToMany(mappedBy = "medecin", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("medecin")
    private List<PriseEnCharge> prisesEnCharge;

    @OneToMany(mappedBy = "medecin", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("medecin")
    private List<RendezVous> rendezVous;

    @OneToMany(mappedBy = "medecin", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AttributionQuestionnaire> attributions;

    @OneToMany(mappedBy = "medecin", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<DocumentMedecin> documents;
}