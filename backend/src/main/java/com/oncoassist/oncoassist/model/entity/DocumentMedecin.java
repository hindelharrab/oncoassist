package com.oncoassist.oncoassist.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "documents_medecin")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class DocumentMedecin {

    @Id
    @GeneratedValue
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(nullable = false)
    private String nom;           // "Diplôme de Médecine"

    @Column(name = "type_document")
    private String typeDocument;  // "DIPLOME" | "LICENCE" | "CONTRAT" | "AUTRE"

    @Column(name = "chemin_fichier")
    private String cheminFichier; // chemin stocké sur le serveur

    @Column(name = "date_ajout")
    private LocalDate dateAjout;

    @Column(name = "taille_fichier")
    private String tailleFichier; // "2.4 MB"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_id", nullable = false)
    private Medecin medecin;

    @PrePersist
    protected void onCreate() {
        if (this.dateAjout == null) this.dateAjout = LocalDate.now();
    }
}