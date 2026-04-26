package com.oncoassist.oncoassist.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "specialites")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"medecins", "secretaires"})

public class Specialite {

    @Id
    @GeneratedValue
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(nullable = false, unique = true)
    private String nom;

    private String description;

    @OneToMany(mappedBy = "specialite", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Medecin> medecins;

    @OneToMany(mappedBy = "specialite", fetch = FetchType.LAZY)
    private List<Secretaire> secretaires;
}