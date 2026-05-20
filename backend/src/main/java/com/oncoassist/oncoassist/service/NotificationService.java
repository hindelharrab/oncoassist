package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.notification.NotificationDTO;
import com.oncoassist.oncoassist.model.entity.Medecin;
import com.oncoassist.oncoassist.model.entity.Notification;
import com.oncoassist.oncoassist.model.entity.enums.NotificationCategorie;
import com.oncoassist.oncoassist.model.entity.enums.NotificationPriorite;
import com.oncoassist.oncoassist.repository.MedecinRepository;
import com.oncoassist.oncoassist.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final MedecinRepository      medecinRepository;

    // ── Notifications d'un médecin ────────────────────────
    public List<NotificationDTO> getByMedecin(UUID medecinId) {
        return notificationRepository
                .findByMedecinIdAndArchiveeFalseOrderByDateCreationDesc(
                        medecinId
                )
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ── Notifications pour la secrétaire ─────────────────
    // rdv + patient + dossier uniquement
    public List<NotificationDTO> getForSecretaire() {
        return notificationRepository
                .findTop20ByArchiveeFalseAndCategorieIn(
                        List.of(
                                NotificationCategorie.rdv,
                                NotificationCategorie.patient,
                                NotificationCategorie.dossier
                        ),
                        Sort.by(Sort.Direction.DESC, "dateCreation")
                )
                .stream()
                .map(n -> {
                    NotificationDTO dto = toDTO(n);
                    // Reformater le texte pour la secrétaire
                    dto.setMessage(
                            reformaterPourSecretaire(n)
                    );
                    dto.setTitre(
                            reformaterTitrePourSecretaire(n)
                    );
                    return dto;
                })
                .toList();
    }

    private String reformaterTitrePourSecretaire(
            Notification n) {
        return switch (n.getCategorie()) {
            case rdv -> "RDV planifié";
            case patient -> "Nouveau patient";
            case dossier -> "Dossier mis à jour";
            default -> n.getTitre();
        };
    }

    private String reformaterPourSecretaire(Notification n) {
        String nomPatient = n.getNomPatient() != null
                ? n.getNomPatient() : "Patient inconnu";

        return switch (n.getCategorie()) {
            case rdv ->
                    "RDV confirmé avec " + nomPatient;
            case patient ->
                    "Le dossier de " + nomPatient
                            + " a été créé avec succès";
            case dossier ->
                    "Dossier de " + nomPatient
                            + " mis à jour";
            default -> n.getMessage();
        };
    }

    // ── Notifications récentes globales ───────────────────
    public List<NotificationDTO> getRecentes() {
        return notificationRepository
                .findTop20ByArchiveeFalseOrderByDateCreationDesc()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ── Compter les non lues ──────────────────────────────
    public long countNonLues(UUID medecinId) {
        return notificationRepository
                .countByMedecinIdAndLueFalseAndArchiveeFalse(
                        medecinId
                );
    }

    // ── Marquer une notification comme lue ───────────────
    @Transactional
    public NotificationDTO marquerLue(UUID notifId) {
        Notification notif = notificationRepository
                .findById(notifId)
                .orElseThrow(() -> new RuntimeException(
                        "Notification non trouvée : " + notifId
                ));
        notif.setLue(true);
        return toDTO(notificationRepository.save(notif));
    }

    // ── Marquer toutes comme lues (médecin) ──────────────
    @Transactional
    public void marquerToutesLues(UUID medecinId) {
        notificationRepository.markAllAsRead(medecinId);
    }

    // ── Archiver une notification ─────────────────────────
    @Transactional
    public void archiver(UUID notifId) {
        Notification notif = notificationRepository
                .findById(notifId)
                .orElseThrow(() -> new RuntimeException(
                        "Notification non trouvée : " + notifId
                ));
        notif.setArchivee(true);
        notificationRepository.save(notif);
    }

    // ── Créer une notification ────────────────────────────
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
        Medecin medecin = medecinRepository
                .findById(medecinId)
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

    // ── Mapper ────────────────────────────────────────────
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