package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.notification.NotificationDTO;
import com.oncoassist.oncoassist.model.entity.Medecin;
import com.oncoassist.oncoassist.model.entity.Notification;
import com.oncoassist.oncoassist.model.entity.Patient;
import com.oncoassist.oncoassist.model.entity.enums.NotificationCategorie;
import com.oncoassist.oncoassist.model.entity.enums.NotificationPriorite;
import com.oncoassist.oncoassist.repository.MedecinRepository;
import com.oncoassist.oncoassist.repository.NotificationRepository;
import com.oncoassist.oncoassist.repository.PatientRepository;
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
    private final PatientRepository      patientRepository;

    // ── MÉDECIN : notifications ───────────────────────────
    public List<NotificationDTO> getByMedecin(UUID medecinId) {
        return notificationRepository
                .findByMedecinIdAndArchiveeFalseOrderByDateCreationDesc(medecinId)
                .stream().map(this::toDTO).toList();
    }

    public List<NotificationDTO> getForSecretaire() {
        return notificationRepository
                .findTop20ByArchiveeFalseAndCategorieIn(
                        List.of(NotificationCategorie.rdv,
                                NotificationCategorie.patient,
                                NotificationCategorie.dossier),
                        Sort.by(Sort.Direction.DESC, "dateCreation"))
                .stream().map(n -> {
                    NotificationDTO dto = toDTO(n);
                    dto.setMessage(reformaterPourSecretaire(n));
                    dto.setTitre(reformaterTitrePourSecretaire(n));
                    return dto;
                }).toList();
    }

    public List<NotificationDTO> getRecentes() {
        return notificationRepository
                .findTop20ByArchiveeFalseOrderByDateCreationDesc()
                .stream().map(this::toDTO).toList();
    }

    public long countNonLues(UUID medecinId) {
        return notificationRepository.countByMedecinIdAndLueFalseAndArchiveeFalse(medecinId);
    }

    @Transactional
    public NotificationDTO marquerLue(UUID notifId) {
        Notification notif = notificationRepository.findById(notifId)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée : " + notifId));
        notif.setLue(true);
        return toDTO(notificationRepository.save(notif));
    }

    @Transactional
    public void marquerToutesLues(UUID medecinId) {
        notificationRepository.markAllAsRead(medecinId);
    }

    @Transactional
    public void archiver(UUID notifId) {
        Notification notif = notificationRepository.findById(notifId)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée : " + notifId));
        notif.setArchivee(true);
        notificationRepository.save(notif);
    }

    // ── CRÉER notification pour MÉDECIN ──────────────────
    @Transactional
    public void creer(UUID medecinId, NotificationCategorie categorie,
                      NotificationPriorite priorite, String titre, String message,
                      String lienAction, String nomPatient, UUID patientId) {
        Medecin medecin = medecinRepository.findById(medecinId)
                .orElseThrow(() -> new RuntimeException("Médecin non trouvé : " + medecinId));

        Notification notif = Notification.builder()
                .medecin(medecin)
                .patientDestinataire(null)
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

    // ── CRÉER notification pour PATIENT ──────────────────
    @Transactional
    public void creerPourPatient(UUID patientId, NotificationCategorie categorie,
                                 NotificationPriorite priorite, String titre, String message,
                                 String lienAction) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient non trouvé : " + patientId));

        Notification notif = Notification.builder()
                .medecin(null)
                .patientDestinataire(patient)
                .categorie(categorie)
                .priorite(priorite)
                .titre(titre)
                .message(message)
                .lienAction(lienAction)
                .nomPatient(patient.getPrenom() + " " + patient.getNom())
                .patientId(patientId)
                .lue(false)
                .archivee(false)
                .dateCreation(LocalDateTime.now())
                .build();

        notificationRepository.save(notif);
    }

    // ── PATIENT : lire ses notifications ─────────────────
    public List<NotificationDTO> getByPatient(UUID patientId) {
        return notificationRepository
                .findByPatientDestinataireIdAndArchiveeFalseOrderByDateCreationDesc(patientId)
                .stream().map(this::toDTO).toList();
    }

    public long countNonLuesPatient(UUID patientId) {
        return notificationRepository.countByPatientDestinataireIdAndLueFalseAndArchiveeFalse(patientId);
    }

    @Transactional
    public void marquerToutesLuesPatient(UUID patientId) {
        notificationRepository.markAllAsReadForPatient(patientId);
    }

    // ── Helpers ───────────────────────────────────────────
    private String reformaterTitrePourSecretaire(Notification n) {
        return switch (n.getCategorie()) {
            case rdv     -> "RDV planifié";
            case patient -> "Nouveau patient";
            case dossier -> "Dossier mis à jour";
            default      -> n.getTitre();
        };
    }

    private String reformaterPourSecretaire(Notification n) {
        String nomPatient = n.getNomPatient() != null ? n.getNomPatient() : "Patient inconnu";
        return switch (n.getCategorie()) {
            case rdv     -> "RDV confirmé avec " + nomPatient;
            case patient -> "Le dossier de " + nomPatient + " a été créé avec succès";
            case dossier -> "Dossier de " + nomPatient + " mis à jour";
            default      -> n.getMessage();
        };
    }

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