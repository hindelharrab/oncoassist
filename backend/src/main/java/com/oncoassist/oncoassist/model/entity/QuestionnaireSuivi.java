package com.oncoassist.oncoassist.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "questions_suivi")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class QuestionnaireSuivi {

    @Id
    @GeneratedValue
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String texte;

    @ElementCollection
    @CollectionTable(
            name = "question_suivi_choix",
            joinColumns = @JoinColumn(name = "question_id")
    )
    @Column(name = "choix")
    private List<String> choix;

    @Column(nullable = false)
    private Integer ordre = 0;

    // NULL = globale, sinon = custom pour ce patient
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = true)
    private Patient patient;
}