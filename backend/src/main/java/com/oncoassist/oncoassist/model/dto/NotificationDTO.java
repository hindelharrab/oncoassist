package com.oncoassist.oncoassist.model.dto.notification;

import com.oncoassist.oncoassist.model.entity.enums.NotificationCategorie;
import com.oncoassist.oncoassist.model.entity.enums.NotificationPriorite;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class NotificationDTO {
    private UUID id;
    private NotificationCategorie categorie;
    private NotificationPriorite priorite;
    private String titre;
    private String message;
    private String lienAction;
    private String nomPatient;
    private UUID patientId;
    private boolean lue;
    private boolean archivee;
    private LocalDateTime dateCreation;
}