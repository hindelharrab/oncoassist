package com.oncoassist.oncoassist.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "images_analyse")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class ImageAnalyse {

    @Id
    @GeneratedValue
    private UUID id;

    // Chemin de l'image PNG originale (224×224)
    @Column(name = "chemin_image", nullable = false)
    private String cheminImage;

    // Chemin de l'image Grad-CAM générée
    @Column(name = "chemin_gradcam")
    private String cheminGradCam;

    // Relation vers la biopsie parente
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "biopsie_id", nullable = false)
    private Biopsie biopsie;
}