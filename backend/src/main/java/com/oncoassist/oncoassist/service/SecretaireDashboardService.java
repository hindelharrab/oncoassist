package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.SecretaireDashboardDTO;
import com.oncoassist.oncoassist.model.entity.Medecin;
import com.oncoassist.oncoassist.model.entity.RendezVous;
import com.oncoassist.oncoassist.model.entity.Secretaire;
import com.oncoassist.oncoassist.model.entity.enums.StatutRDVEnum;
import com.oncoassist.oncoassist.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SecretaireDashboardService {

    private final SecretaireRepository secretaireRepository;
    private final MedecinRepository    medecinRepository;
    private final PatientRepository    patientRepository;
    private final RendezVousRepository rendezVousRepository;

    public SecretaireDashboardDTO getDashboard(String emailSecretaire) {

        /* ── 1. Secrétaire + spécialité ─────────────────────── */
        Secretaire secretaire = secretaireRepository.findByEmail(emailSecretaire)
                .orElseThrow(() -> new EntityNotFoundException("Secrétaire non trouvée : " + emailSecretaire));

        UUID specialiteId = (secretaire.getSpecialite() != null)
                ? secretaire.getSpecialite().getId()
                : null;

        /* ── 2. Médecins de la spécialité ────────────────────── */
        List<Medecin> medecins = (specialiteId != null)
                ? medecinRepository.findBySpecialiteId(specialiteId)
                : List.of();

        List<UUID> medecinIds = medecins.stream()
                .map(Medecin::getId)
                .toList();

        /* ── 3. Bornes temporelles ───────────────────────────── */
        LocalDate    today        = LocalDate.now();
        LocalDateTime debutJour   = today.atStartOfDay();
        LocalDateTime finJour     = debutJour.plusDays(1);

        LocalDateTime debutSemaine = today
                .with(java.time.DayOfWeek.MONDAY).atStartOfDay();
        LocalDateTime finSemaine   = debutSemaine.plusDays(7);

        LocalDateTime debutAnnee  = today.withDayOfYear(1).atStartOfDay();
        LocalDateTime finAnnee    = debutAnnee.plusYears(1);

        /* ── 4. Tous les RDV de l'année (avec détails) ───────── */
        List<RendezVous> tousRdvAnnee = rendezVousRepository
                .findByPeriodWithDetails(debutAnnee, finAnnee);

        // Filtrer uniquement ceux des médecins de la spécialité
        List<RendezVous> rdvSpecialite = tousRdvAnnee.stream()
                .filter(r -> r.getMedecin() != null
                        && medecinIds.contains(r.getMedecin().getId()))
                .toList();

        /* ── 5. RDV du jour de la spécialité ─────────────────── */
        List<RendezVous> rdvJour = rdvSpecialite.stream()
                .filter(r -> r.getDate() != null
                        && !r.getDate().isBefore(debutJour)
                        && r.getDate().isBefore(finJour))
                .sorted(Comparator.comparing(RendezVous::getDate))
                .toList();

        /* ── 6. Stats cards ──────────────────────────────────── */
        long totalPatients = patientRepository.count();

        long rdvAujourdhui = rdvJour.size();

        long rdvEnAttente = rdvSpecialite.stream()
                .filter(r -> r.getStatut() == StatutRDVEnum.EN_ATTENTE)
                .count();

        long rdvPlanifiesSemaine = rdvSpecialite.stream()
                .filter(r -> r.getDate() != null
                        && r.getStatut() == StatutRDVEnum.PLANIFIE
                        && !r.getDate().isBefore(debutSemaine)
                        && r.getDate().isBefore(finSemaine))
                .count();

        /* ── 7. Flux journalier (DTOs) ───────────────────────── */
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");

        List<SecretaireDashboardDTO.RdvJourDTO> rdvDuJour = rdvJour.stream()
                .map(r -> SecretaireDashboardDTO.RdvJourDTO.builder()
                        .id(r.getId().toString())
                        .heure(r.getDate().format(timeFmt))
                        .patient(r.getPatient() != null
                                ? r.getPatient().getPrenom() + " " + r.getPatient().getNom()
                                : "—")
                        .medecin(r.getMedecin() != null
                                ? "Dr. " + r.getMedecin().getNom()
                                : "—")
                        .motif(r.getMotif() != null ? r.getMotif() : "")
                        .lieu(r.getLieu()  != null ? r.getLieu()  : "")
                        .statut(r.getStatut() != null ? r.getStatut().name() : "EN_ATTENTE")
                        .build())
                .toList();

        /* ── 8. Médecins avec statut temps réel ──────────────── */
        LocalDateTime maintenant = LocalDateTime.now();

        List<SecretaireDashboardDTO.MedecinStatutDTO> medecinStats = medecins.stream()
                .map(m -> {

                    // RDV du jour pour ce médecin
                    List<RendezVous> rdvMedecinJour = rdvSpecialite.stream()
                            .filter(r -> r.getMedecin() != null
                                    && r.getMedecin().getId().equals(m.getId())
                                    && r.getDate() != null
                                    && !r.getDate().isBefore(debutJour)
                                    && r.getDate().isBefore(finJour))
                            .toList();

                    long nbRdvAujourdhui = rdvMedecinJour.size();

                    // Nombre de patients distincts (tous RDV confondus)
                    long nbPatients = rdvSpecialite.stream()
                            .filter(r -> r.getMedecin() != null
                                    && r.getMedecin().getId().equals(m.getId())
                                    && r.getPatient() != null)
                            .map(r -> r.getPatient().getId())
                            .distinct()
                            .count();

                    // Statut temps réel basé sur les RDV ±30/15 min
                    boolean enConsultation = rdvMedecinJour.stream()
                            .anyMatch(r -> r.getStatut() == StatutRDVEnum.PLANIFIE
                                    && !r.getDate().isBefore(maintenant.minusMinutes(30))
                                    && r.getDate().isBefore(maintenant.plusMinutes(15)));

                    String statut;
                    if (enConsultation) {
                        statut = "En Consultation";
                    } else if (nbRdvAujourdhui > 0) {
                        statut = "Disponible";
                    } else {
                        statut = "Absent";
                    }

                    // Initiales
                    String initiales = "";
                    if (m.getPrenom() != null && !m.getPrenom().isBlank())
                        initiales += Character.toUpperCase(m.getPrenom().charAt(0));
                    if (m.getNom() != null && !m.getNom().isBlank())
                        initiales += Character.toUpperCase(m.getNom().charAt(0));

                    return SecretaireDashboardDTO.MedecinStatutDTO.builder()
                            .id(m.getId().toString())
                            .nom(m.getNom())
                            .prenom(m.getPrenom())
                            .initiales(initiales)
                            .statut(statut)
                            .nbRdvAujourdhui(nbRdvAujourdhui)
                            .nbPatients(nbPatients)
                            .build();
                })
                .toList();

        /* ── 9. Activité mensuelle (12 mois année en cours) ───── */
        int anneeActuelle = today.getYear();
        List<Integer> rdvParMois      = new ArrayList<>(Collections.nCopies(12, 0));
        List<Integer> patientsParMois = new ArrayList<>(Collections.nCopies(12, 0));

        for (RendezVous r : rdvSpecialite) {
            if (r.getDate() == null) continue;
            if (r.getDate().getYear() != anneeActuelle) continue;
            int moisIdx = r.getDate().getMonthValue() - 1; // 0-based
            rdvParMois.set(moisIdx, rdvParMois.get(moisIdx) + 1);
            if (r.getPatient() != null) {
                patientsParMois.set(moisIdx, patientsParMois.get(moisIdx) + 1);
            }
        }

        /* ── 10. Indicateurs de performance ──────────────────── */
        long totalRdvSpecialite = rdvSpecialite.size();

        long rdvConfirmesOuEffectues = rdvSpecialite.stream()
                .filter(r -> r.getStatut() == StatutRDVEnum.PLANIFIE
                        || r.getStatut() == StatutRDVEnum.EFFECTUE)
                .count();

        long rdvEffectues = rdvSpecialite.stream()
                .filter(r -> r.getStatut() == StatutRDVEnum.EFFECTUE)
                .count();

        long medecinsActifsAujourdhui = medecins.stream()
                .filter(m -> rdvSpecialite.stream()
                        .anyMatch(r -> r.getMedecin() != null
                                && r.getMedecin().getId().equals(m.getId())
                                && r.getDate() != null
                                && !r.getDate().isBefore(debutJour)
                                && r.getDate().isBefore(finJour)))
                .count();

        int tauxConfirmes = totalRdvSpecialite > 0
                ? (int) (rdvConfirmesOuEffectues * 100 / totalRdvSpecialite) : 0;

        int tauxTraites = totalRdvSpecialite > 0
                ? (int) (rdvEffectues * 100 / totalRdvSpecialite) : 0;

        int tauxMedecinsActifs = !medecins.isEmpty()
                ? (int) (medecinsActifsAujourdhui * 100 / medecins.size()) : 0;

        int tauxNotifs = totalRdvSpecialite > 0
                ? (int) ((totalRdvSpecialite - rdvEnAttente) * 100 / totalRdvSpecialite) : 100;

        /* ── 11. Construction du DTO final ───────────────────── */
        return SecretaireDashboardDTO.builder()
                .totalPatients(totalPatients)
                .rdvAujourdhui(rdvAujourdhui)
                .rdvEnAttente(rdvEnAttente)
                .rdvPlanifiesSemaine(rdvPlanifiesSemaine)
                .rdvDuJour(rdvDuJour)
                .medecins(medecinStats)
                .rdvParMois(rdvParMois)
                .patientsParMois(patientsParMois)
                .tauxRdvConfirmes(tauxConfirmes)
                .tauxPatientsTraites(tauxTraites)
                .tauxMedecinsActifs(tauxMedecinsActifs)
                .tauxNotifsTraitees(tauxNotifs)
                .build();
    }
}