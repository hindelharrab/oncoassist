package com.oncoassist.oncoassist.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "biopsies")
@DiscriminatorValue("BIOPSIE")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)

public class Biopsie extends Examen {

    // Grossissement choisi par le médecin
    @Column(name = "grossissement")
    private String grossissement;

    // Images analysées avec leur Grad-CAM
    @OneToMany(
            mappedBy = "biopsie",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY,
            orphanRemoval = true
    )
    private List<ImageAnalyse> imagesAnalysees;

    // ── Résultat final unique ──

    // "BENIN" ou "MALIN"
    @Column(name = "classe_binaire")
    private String classeBinaire;

    // Score confiance binaire (0.0 → 1.0)
    @Column(name = "score_benign_malin")
    private Float scoreBenignMalin;

    // Type exact (ductal_carcinoma, fibroadenoma...)
    @Column(name = "type_tumeur")
    private String typeTumeur;

    // Score confiance du type (0.0 → 1.0)
    @Column(name = "score_type_confiance")
    private Float scoreTypeConfiance;
}