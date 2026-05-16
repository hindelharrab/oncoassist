package com.oncoassist.oncoassist.model.entity;

import com.oncoassist.oncoassist.model.entity.enums.NotificationCategorie;
import com.oncoassist.oncoassist.model.entity.enums.NotificationPriorite;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationCategorie categorie;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationPriorite priorite;

    @Column(nullable = false)
    private String titre;

    @Column(length = 500)
    private String message;

    @Column(name = "lien_action")
    private String lienAction;

    @Column(name = "nom_patient")
    private String nomPatient;

    @Column(name = "patient_id")
    private UUID patientId;

    @Column(nullable = false)
    private boolean lue = false;

    @Column(nullable = false)
    private boolean archivee = false;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    // Destinataire — le médecin
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_id", nullable = false)
    private Medecin medecin;
}