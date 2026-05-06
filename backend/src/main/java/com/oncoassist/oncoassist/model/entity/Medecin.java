package com.oncoassist.oncoassist.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.oncoassist.oncoassist.model.entity.*;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "medecins")
@DiscriminatorValue("MEDECIN")
@Getter
@Setter @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(exclude = {"prisesEnCharge", "rendezVous", "attributions"})

// ✅ Casse les cycles de sérialisation
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})

public class Medecin extends Utilisateur {

    @Column(name = "numero_ordre", unique = true, nullable = false)
    private String numeroOrdre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialite_id")
    @JsonIgnoreProperties({"secretaires", "hibernateLazyInitializer"}) // ✅
    private Specialite specialite;

    @OneToMany(mappedBy = "medecin", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("medecin") // ✅ casse le cycle medecin → prisesEnCharge → medecin
    private List<PriseEnCharge> prisesEnCharge;

    @OneToMany(mappedBy = "medecin", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("medecin") // ✅
    private List<RendezVous> rendezVous;

    @OneToMany(mappedBy = "medecin", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("medecin") // ✅
    private List<AttributionQuestionnaire> attributions;
}