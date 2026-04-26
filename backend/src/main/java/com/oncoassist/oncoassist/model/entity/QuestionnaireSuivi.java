package com.oncoassist.oncoassist.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "questionnaires_suivi")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = "attribution")

public class QuestionnaireSuivi {

    @Id
    @GeneratedValue
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(name = "date_remplissage", nullable = false)
    private LocalDate dateRemplissage;

    @Column(columnDefinition = "TEXT")
    private String reponses;

    @Column(nullable = false)
    private Boolean complete = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attribution_id", nullable = false)
    private AttributionQuestionnaire attribution;
}