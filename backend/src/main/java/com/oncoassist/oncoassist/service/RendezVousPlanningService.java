package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.RendezVousDTO;
import com.oncoassist.oncoassist.model.entity.Medecin;
import com.oncoassist.oncoassist.model.entity.Patient;
import com.oncoassist.oncoassist.model.entity.RendezVous;
import com.oncoassist.oncoassist.model.entity.enums.NotificationCategorie;
import com.oncoassist.oncoassist.model.entity.enums.NotificationPriorite;
import com.oncoassist.oncoassist.model.entity.enums.StatutRDVEnum;
import com.oncoassist.oncoassist.repository.MedecinRepository;
import com.oncoassist.oncoassist.repository.PatientRepository;
import com.oncoassist.oncoassist.repository.RendezVousRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RendezVousPlanningService {

    private final RendezVousRepository rendezVousRepository;
    private final MedecinRepository    medecinRepository;
    private final PatientRepository    patientRepository;
    private final NotificationService  notificationService;

    private static final DateTimeFormatter TIME_FMT =
            DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final int DEFAULT_DUREE = 30;

    // ════════════════════════════════════════════════
    // PLANNING SEMAINE
    // ════════════════════════════════════════════════
    @Transactional(readOnly = true)
    public List<RendezVousDTO> getRdvBySemaine(
            LocalDate dateReference, UUID medecinId) {

        LocalDate lundi = dateReference.with(
                TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)
        );
        LocalDateTime debut = lundi.atStartOfDay();
        LocalDateTime fin   = lundi.plusDays(6).atTime(LocalTime.MAX);

        List<RendezVous> rdvs = medecinId != null
                ? rendezVousRepository
                .findByMedecinIdAndDateBetween(
                        medecinId, debut, fin)
                : rendezVousRepository
                .findByDateBetween(debut, fin);

        return rdvs.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ════════════════════════════════════════════════
    // CRÉER
    // ════════════════════════════════════════════════
    @Transactional
    public RendezVousDTO creer(RendezVousDTO dto) {
        RendezVous rdv = new RendezVous();
        rdv.setDate(dto.getDate());
        rdv.setMotif(dto.getMotif());
        rdv.setLieu(dto.getLieu());
        rdv.setDateCreation(LocalDateTime.now());
        rdv.setStatut(dto.getStatut() != null
                ? dto.getStatut()
                : StatutRDVEnum.EN_ATTENTE);

        if (dto.getPatientId() != null) {
            Patient patient = patientRepository
                    .findById(dto.getPatientId())
                    .orElseThrow(() -> new RuntimeException(
                            "Patient introuvable : "
                                    + dto.getPatientId()
                    ));
            rdv.setPatient(patient);
        }

        if (dto.getMedecinId() != null) {
            Medecin medecin = medecinRepository
                    .findById(dto.getMedecinId())
                    .orElseThrow(() -> new RuntimeException(
                            "Médecin introuvable : "
                                    + dto.getMedecinId()
                    ));
            rdv.setMedecin(medecin);
        }

        RendezVous saved = rendezVousRepository.save(rdv);

        // ── Notification au médecin ───────────────
        // Notification pour le MÉDECIN
        if (saved.getMedecin() != null) {
            String nomPatient = buildNomPatient(saved);
            String dateFormatee = buildDateFormatee(saved.getDate());
            try {
                notificationService.creer(
                        saved.getMedecin().getId(),
                        NotificationCategorie.rdv,
                        NotificationPriorite.NORMALE,
                        "Nouveau RDV planifié",
                        "La secrétaire a planifié un RDV avec "
                                + nomPatient + " le " + dateFormatee,
                        "/medecin/planning",
                        nomPatient,
                        saved.getPatient() != null
                                ? saved.getPatient().getId() : null
                );
            } catch (Exception e) {
                System.err.println("⚠️ Notif médecin échouée : "
                        + e.getMessage());
            }
        }

        return toDTO(saved);
    }

    // ════════════════════════════════════════════════
    // MODIFIER
    // ════════════════════════════════════════════════
    @Transactional
    public RendezVousDTO modifier(UUID id, RendezVousDTO dto) {
        RendezVous rdv = rendezVousRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "RDV introuvable : " + id
                ));

        StatutRDVEnum ancienStatut = rdv.getStatut();

        if (dto.getDate()   != null) rdv.setDate(dto.getDate());
        if (dto.getMotif()  != null) rdv.setMotif(dto.getMotif());
        if (dto.getLieu()   != null) rdv.setLieu(dto.getLieu());
        if (dto.getStatut() != null) rdv.setStatut(dto.getStatut());

        if (dto.getPatientId() != null) {
            rdv.setPatient(patientRepository
                    .findById(dto.getPatientId())
                    .orElseThrow(() -> new RuntimeException(
                            "Patient introuvable"
                    )));
        }

        if (dto.getMedecinId() != null) {
            rdv.setMedecin(medecinRepository
                    .findById(dto.getMedecinId())
                    .orElseThrow(() -> new RuntimeException(
                            "Médecin introuvable"
                    )));
        }

        RendezVous saved = rendezVousRepository.save(rdv);

        // ── Notification si RDV annulé ────────────
        if (dto.getStatut() == StatutRDVEnum.ANNULE
                && ancienStatut != StatutRDVEnum.ANNULE
                && saved.getMedecin() != null) {

            String nomPatient = buildNomPatient(saved);
            try {
                notificationService.creer(
                        saved.getMedecin().getId(),
                        NotificationCategorie.rdv,
                        NotificationPriorite.HAUTE,
                        "RDV annulé",
                        "Le RDV avec " + nomPatient
                                + " a été annulé",
                        "/medecin/planning",
                        nomPatient,
                        saved.getPatient() != null
                                ? saved.getPatient().getId()
                                : null
                );
            } catch (Exception e) {
                System.err.println(
                        "⚠️ Notif RDV annulé échouée : "
                                + e.getMessage()
                );
            }
        }

        // ── Notification si RDV confirmé ──────────
        if (dto.getStatut() == StatutRDVEnum.PLANIFIE
                && ancienStatut == StatutRDVEnum.EN_ATTENTE
                && saved.getMedecin() != null) {

            String nomPatient = buildNomPatient(saved);
            String dateFormatee = buildDateFormatee(
                    saved.getDate()
            );
            try {
                notificationService.creer(
                        saved.getMedecin().getId(),
                        NotificationCategorie.rdv,
                        NotificationPriorite.NORMALE,
                        "RDV confirmé",
                        "RDV avec " + nomPatient
                                + " confirmé le "
                                + dateFormatee,
                        "/medecin/planning",
                        nomPatient,
                        saved.getPatient() != null
                                ? saved.getPatient().getId()
                                : null
                );
            } catch (Exception e) {
                System.err.println(
                        "⚠️ Notif RDV confirmé échouée : "
                                + e.getMessage()
                );
            }
        }

        return toDTO(saved);
    }

    // ════════════════════════════════════════════════
    // ANNULER
    // ════════════════════════════════════════════════
    @Transactional
    public RendezVousDTO annuler(UUID id) {
        RendezVous rdv = rendezVousRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "RDV introuvable : " + id
                ));
        rdv.setStatut(StatutRDVEnum.ANNULE);
        RendezVous saved = rendezVousRepository.save(rdv);

        // ── Notification annulation ───────────────
        if (saved.getMedecin() != null) {
            String nomPatient = buildNomPatient(saved);
            try {
                notificationService.creer(
                        saved.getMedecin().getId(),
                        NotificationCategorie.rdv,
                        NotificationPriorite.HAUTE,
                        "RDV annulé",
                        "Le RDV avec " + nomPatient
                                + " a été annulé "
                                + "par la secrétaire",
                        "/medecin/planning",
                        nomPatient,
                        saved.getPatient() != null
                                ? saved.getPatient().getId()
                                : null
                );
            } catch (Exception e) {
                System.err.println(
                        "⚠️ Notif annulation échouée : "
                                + e.getMessage()
                );
            }
        }

        return toDTO(saved);
    }

    // ════════════════════════════════════════════════
    // MAPPER
    // ════════════════════════════════════════════════
    public RendezVousDTO toDTO(RendezVous rdv) {
        RendezVousDTO dto = RendezVousDTO.builder()
                .id(rdv.getId())
                .motif(rdv.getMotif())
                .statut(rdv.getStatut())
                .date(rdv.getDate())
                .lieu(rdv.getLieu())
                .dateCreation(rdv.getDateCreation())
                .duree(DEFAULT_DUREE)
                .build();

        if (rdv.getPatient() != null) {
            dto.setPatientId(rdv.getPatient().getId());
            dto.setPatientNom(rdv.getPatient().getNom());
            dto.setPatientPrenom(rdv.getPatient().getPrenom());
        }

        if (rdv.getMedecin() != null) {
            dto.setMedecinId(rdv.getMedecin().getId());
            dto.setMedecinNom(rdv.getMedecin().getNom());
            dto.setMedecinPrenom(rdv.getMedecin().getPrenom());
            if (rdv.getMedecin().getSpecialite() != null) {
                dto.setMedecinSpecialite(
                        rdv.getMedecin().getSpecialite().getNom()
                );
            }
        }

        if (rdv.getDate() != null) {
            dto.setHeure(rdv.getDate().format(TIME_FMT));
            int jourOffset =
                    rdv.getDate().getDayOfWeek().getValue() - 1;
            dto.setJourOffset(jourOffset);
            String[] jours = {
                    "Lun","Mar","Mer","Jeu","Ven","Sam","Dim"
            };
            dto.setJour(jours[jourOffset]);
        }

        return dto;
    }

    // ════════════════════════════════════════════════
    // HELPERS PRIVÉS
    // ════════════════════════════════════════════════
    private String buildNomPatient(RendezVous rdv) {
        if (rdv.getPatient() == null) return "Patient inconnu";
        return rdv.getPatient().getPrenom()
                + " " + rdv.getPatient().getNom();
    }

    private String buildDateFormatee(LocalDateTime date) {
        if (date == null) return "—";
        return date.toLocalDate().format(DATE_FMT)
                + " à " + date.format(TIME_FMT);
    }
}