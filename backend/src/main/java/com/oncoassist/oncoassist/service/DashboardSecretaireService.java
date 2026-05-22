package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.dashboard
        .DashboardSecretaireDTO;
import com.oncoassist.oncoassist.model.entity.enums
        .StatutRDVEnum;
import com.oncoassist.oncoassist.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardSecretaireService {

    private final PatientRepository       patientRepository;
    private final RendezVousRepository    rendezVousRepository;
    private final MedecinRepository       medecinRepository;
    private final NotificationRepository  notificationRepository;
    private final DossierMedicalRepository dossierRepository;

    public DashboardSecretaireDTO getStats() {

        LocalDateTime debutJour =
                LocalDate.now().atStartOfDay();
        LocalDateTime finJour =
                LocalDate.now().atTime(23, 59, 59);

        // ── Patients ───────────────────────────────
        long totalPatients =
                patientRepository.count();

        YearMonth mois = YearMonth.now();
        LocalDateTime debutMois =
                mois.atDay(1).atStartOfDay();
        long patientsNouveauMois =
                patientRepository.countNouveauxDepuis(
                        mois.atDay(1)  // LocalDate pas LocalDateTime
                );
        // ── RDV ────────────────────────────────────
        long rdvAujourdhui =
                rendezVousRepository
                        .countByDateBetween(debutJour, finJour);

        long rdvEnAttente =
                rendezVousRepository
                        .countByStatutAndDateBetween(
                                StatutRDVEnum.EN_ATTENTE,
                                debutJour, finJour
                        );

        long rdvEnCours =
                rendezVousRepository
                        .countByStatutAndDateBetween(
                                StatutRDVEnum.PLANIFIE,
                                debutJour, finJour
                        );

        long rdvConfirmes =
                rendezVousRepository
                        .countByStatutAndDateBetween(
                                StatutRDVEnum.EFFECTUE,
                                debutJour, finJour
                        );

        // ── Médecins ───────────────────────────────
        long totalMedecins = medecinRepository.count();
        long medecinsActifs =
                medecinRepository
                        .countByPrisesEnChargeIsNotEmpty();

        // ── Notifications non lues ─────────────────
        long notifNonLues =
                notificationRepository
                        .countByArchiveeFalseAndLueFalse();

        long totalNotifs =
                notificationRepository
                        .countByArchiveeFalse();

        // ── Dossiers ───────────────────────────────
        long totalDossiers = dossierRepository.count();
        long dossiersActifs =
                dossierRepository
                        .countByStatut(
                                com.oncoassist.oncoassist.model
                                        .entity.enums.StatutDossierEnum.ACTIF
                        );

        // ── Performance % ──────────────────────────
        int pctRdvConfirmes = rdvAujourdhui > 0
                ? (int) (rdvConfirmes * 100 / rdvAujourdhui)
                : 0;

        int pctDossiersActifs = totalDossiers > 0
                ? (int) (dossiersActifs * 100 / totalDossiers)
                : 0;

        int pctMedecinsActifs = totalMedecins > 0
                ? (int) (medecinsActifs * 100 / totalMedecins)
                : 0;

        int pctNotifsTraitees = totalNotifs > 0
                ? (int) ((totalNotifs - notifNonLues)
                * 100 / totalNotifs)
                : 100;

        return DashboardSecretaireDTO.builder()
                .totalPatients(totalPatients)
                .rdvAujourdhui(rdvAujourdhui)
                .rdvEnAttente(rdvEnAttente)
                .rdvEnCours(rdvEnCours)
                .notificationsNonLues(notifNonLues)
                .patientsNouveauMois(patientsNouveauMois)
                .totalMedecins(totalMedecins)
                .medecinsActifs(medecinsActifs)
                .pctRdvConfirmes(pctRdvConfirmes)
                .pctDossiersActifs(pctDossiersActifs)
                .pctMedecinsActifs(pctMedecinsActifs)
                .pctNotifsTraitees(pctNotifsTraitees)
                .build();
    }
}