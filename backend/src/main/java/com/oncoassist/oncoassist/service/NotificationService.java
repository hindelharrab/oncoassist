package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.notification.NotificationDTO;
import com.oncoassist.oncoassist.model.entity.Medecin;
import com.oncoassist.oncoassist.model.entity.Notification;
import com.oncoassist.oncoassist.model.entity.enums.NotificationCategorie;
import com.oncoassist.oncoassist.model.entity.enums.NotificationPriorite;
import com.oncoassist.oncoassist.repository.MedecinRepository;
import com.oncoassist.oncoassist.repository.NotificationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final MedecinRepository      medecinRepository;

    // ── Récupérer toutes les notifications d'un médecin ──
    public List<NotificationDTO> getByMedecin(UUID medecinId) {
        return notificationRepository
                .findByMedecinIdAndArchiveeFalseOrderByDateCreationDesc(medecinId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ── Compter les non lues ─────────────────────────────
    public long countNonLues(UUID medecinId) {
        return notificationRepository
                .countByMedecinIdAndLueFalseAndArchiveeFalse(medecinId);
    }

    // ── Marquer une notification comme lue ───────────────
    @Transactional
    public NotificationDTO marquerLue(UUID notifId) {
        Notification notif = notificationRepository.findById(notifId)
                .orElseThrow(() -> new RuntimeException(
                        "Notification non trouvée : " + notifId
                ));
        notif.setLue(true);
        return toDTO(notificationRepository.save(notif));
    }

    // ── Marquer toutes comme lues ────────────────────────
    @Transactional
    public void marquerToutesLues(UUID medecinId) {
        notificationRepository.markAllAsRead(medecinId);
    }

    // ── Archiver une notification ────────────────────────
    @Transactional
    public void archiver(UUID notifId) {
        Notification notif = notificationRepository.findById(notifId)
                .orElseThrow(() -> new RuntimeException(
                        "Notification non trouvée : " + notifId
                ));
        notif.setArchivee(true);
        notificationRepository.save(notif);
    }

    // ── Créer une notification (appelé depuis d'autres services) ──
    @Transactional
    public void creer(
            UUID medecinId,
            NotificationCategorie categorie,
            NotificationPriorite priorite,
            String titre,
            String message,
            String lienAction,
            String nomPatient,
            UUID patientId
    ) {
        Medecin medecin = medecinRepository.findById(medecinId)
                .orElseThrow(() -> new RuntimeException(
                        "Médecin non trouvé : " + medecinId
                ));

        Notification notif = Notification.builder()
                .medecin(medecin)
                .categorie(categorie)
                .priorite(priorite)
                .titre(titre)
                .message(message)
                .lienAction(lienAction)
                .nomPatient(nomPatient)
                .patientId(patientId)
                .lue(false)
                .archivee(false)
                .dateCreation(LocalDateTime.now())
                .build();

        notificationRepository.save(notif);
    }

    // ── Mapper ───────────────────────────────────────────
    private NotificationDTO toDTO(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .categorie(n.getCategorie())
                .priorite(n.getPriorite())
                .titre(n.getTitre())
                .message(n.getMessage())
                .lienAction(n.getLienAction())
                .nomPatient(n.getNomPatient())
                .patientId(n.getPatientId())
                .lue(n.isLue())
                .archivee(n.isArchivee())
                .dateCreation(n.getDateCreation())
                .build();
    }
}