package com.oncoassist.oncoassist.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "secretaires")
@DiscriminatorValue("SECRETAIRE")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(exclude = {"rendezVousGeres"})

public class Secretaire extends Utilisateur {

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "specialite_id")
    private Specialite specialite;

    @OneToMany(mappedBy = "secretaire", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RendezVous> rendezVousGeres;
}