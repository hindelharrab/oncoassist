package com.oncoassist.oncoassist.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "reponses_questionnaire")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ReponseQuestionnaire {

    @Id
    @GeneratedValue
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(name = "choix_selectionne", nullable = false)
    private String choixSelectionne;

    @Column(name = "date_reponse", nullable = false)
    private LocalDate dateReponse;

    // Qui a répondu
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    // À quelle question
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private QuestionnaireSuivi question;

    // Dans quel contexte (quelle attribution)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attribution_id", nullable = false)
    private AttributionQuestionnaire attribution;
}