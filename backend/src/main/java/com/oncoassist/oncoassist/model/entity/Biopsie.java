package com.oncoassist.oncoassist.model.entity;

import jakarta.persistence.*;
import lombok.*;

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

    @Column(name = "image_radio", nullable = false)
    private String imageRadio;

    @Column(name = "type_tumeur")
    private String typeTumeur;

    @Column(name = "score_benign_malin")
    private Float scoreBenignMalin;

    @Column(name = "heatmap_url")
    private String heatmapUrl;
}