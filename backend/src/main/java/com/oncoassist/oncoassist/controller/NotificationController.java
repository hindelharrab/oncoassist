package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.dto.notification.NotificationDTO;
import com.oncoassist.oncoassist.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // Toutes les notifications d'un médecin
    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<List<NotificationDTO>> getByMedecin(
            @PathVariable UUID medecinId) {
        return ResponseEntity.ok(
                notificationService.getByMedecin(medecinId)
        );
    }
    // Notifications générales (pas liées à un médecin)
// Pour la secrétaire — toutes les notifs récentes
    @GetMapping("/secretaire/{secretaireId}")
    public ResponseEntity<List<NotificationDTO>> getBySecretaire(
            @PathVariable UUID secretaireId) {
        return ResponseEntity.ok(
                notificationService.getForSecretaire()
        );
    }
    // Compter les non lues
    @GetMapping("/medecin/{medecinId}/count")
    public ResponseEntity<Map<String, Long>> countNonLues(
            @PathVariable UUID medecinId) {
        return ResponseEntity.ok(Map.of(
                "nonLues",
                notificationService.countNonLues(medecinId)
        ));
    }


    // Marquer une notification comme lue
    @PatchMapping("/{id}/lue")
    public ResponseEntity<NotificationDTO> marquerLue(
            @PathVariable UUID id) {
        return ResponseEntity.ok(
                notificationService.marquerLue(id)
        );
    }

    // Marquer toutes comme lues
    @PatchMapping("/medecin/{medecinId}/tout-lire")
    public ResponseEntity<Void> marquerToutesLues(
            @PathVariable UUID medecinId) {
        notificationService.marquerToutesLues(medecinId);
        return ResponseEntity.ok().build();
    }

    // Archiver une notification
    @PatchMapping("/{id}/archiver")
    public ResponseEntity<Void> archiver(
            @PathVariable UUID id) {
        notificationService.archiver(id);
        return ResponseEntity.ok().build();
    }
}