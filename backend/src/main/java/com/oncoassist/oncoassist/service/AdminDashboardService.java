package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.admin.*;
import com.oncoassist.oncoassist.model.entity.Medecin;
import com.oncoassist.oncoassist.model.entity.RendezVous;
import com.oncoassist.oncoassist.model.entity.Secretaire;
import com.oncoassist.oncoassist.model.entity.enums.StatutDossierEnum;
import com.oncoassist.oncoassist.model.entity.enums.StatutRDVEnum;
import com.oncoassist.oncoassist.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final RendezVousRepository    rdvRepo;
    private final MedecinRepository       medecinRepo;
    private final PatientRepository       patientRepo;
    private final DossierMedicalRepository dossierRepo;
    private final SecretaireRepository    secretaireRepo;

    // ─────────────────────────────────────────────────────────────────────────
    public DashboardOverviewDTO getOverview() {
        return DashboardOverviewDTO.builder()
                .stats(buildStats())
                .rdvMensuel(buildRdvMensuel())
                .patientsByMedecin(buildPatientsByMedecin())
                .specialites(buildSpecialites())
                .dossiersMensuel(buildDossiersMensuel())
                .topMedecins(buildTopMedecins())
                .secretaires(buildSecretaires())
                .build();
    }

    // ── STATS ────────────────────────────────────────────────────────────────
    private DashboardStatsDTO buildStats() {

        LocalDateTime now        = LocalDateTime.now();
        LocalDateTime startDay   = now.toLocalDate().atStartOfDay();
        LocalDateTime endDay     = startDay.plusDays(1);
        LocalDateTime startMonth = now.toLocalDate().withDayOfMonth(1).atStartOfDay();
        LocalDateTime endMonth   = startMonth.plusMonths(1);
        LocalDateTime startWeek  = now.toLocalDate().with(
                java.time.DayOfWeek.MONDAY).atStartOfDay();

        // ── Carte 1 : RDV ────────────────────────────────────────────────────
        List<RendezVous> rdvAujourd =
                rdvRepo.findByDateBetween(startDay, endDay);

        long rdvDuJour   = rdvAujourd.size();
        long effectues   = rdvAujourd.stream()
                .filter(r -> r.getStatut() == StatutRDVEnum.EFFECTUE).count();
        long enAttente   = rdvAujourd.stream()
                .filter(r -> r.getStatut() == StatutRDVEnum.EN_ATTENTE).count();
        long annules     = rdvAujourd.stream()
                .filter(r -> r.getStatut() == StatutRDVEnum.ANNULE).count();

        long rdvSemaine  = rdvRepo.findByDateBetween(startWeek, endDay).size();
        long rdvMois     = rdvRepo.findByDateBetween(startMonth, endMonth).size();
        long annulesMois = rdvRepo.findByDateBetween(startMonth, endMonth).stream()
                .filter(r -> r.getStatut() == StatutRDVEnum.ANNULE).count();

        // Mois précédent pour le change %
        long rdvMoisPrec = rdvRepo.findByDateBetween(
                startMonth.minusMonths(1), startMonth).size();
        String rdvChange = formatChange(rdvMois, rdvMoisPrec);

        int tauxCompletion = rdvDuJour > 0
                ? (int) Math.round((effectues * 100.0) / rdvDuJour) : 0;

        // Spark : 7 derniers jours
        List<Long> rdvSpark = buildDailySpark(7);

        // ── Carte 2 : Médecins ───────────────────────────────────────────────
        long medecinsTotal   = medecinRepo.count();
        long medNouveaux     = medecinRepo.countCreatedBetween(startMonth, endMonth);
        long medMoisPrec     = medecinRepo.countCreatedBetween(
                startMonth.minusMonths(1), startMonth);
        String medChange     = (medNouveaux > 0 ? "+" : "") + medNouveaux;

        // Répartition par spécialité
        Map<String, Long> bySpec = medecinRepo.countBySpecialite().stream()
                .collect(Collectors.toMap(
                        row -> (String)  row[0],
                        row -> (Long)    row[1]
                ));

        long generalistes  = bySpec.getOrDefault("Médecine Générale", 0L);
        long specialistes  = medecinsTotal - generalistes;

        // Disponibilité : médecins avec au moins 1 RDV ce mois / total
        long medAvecRdv = medecinRepo.findAll().stream()
                .filter(m -> !rdvRepo.findByMedecinIdAndDateBetween(
                        m.getId(), startMonth, endMonth).isEmpty())
                .count();
        int disponibilite = medecinsTotal > 0
                ? (int) Math.round((medAvecRdv * 100.0) / medecinsTotal) : 0;

        double consultParJour = rdvMois > 0
                ? Math.round((rdvMois / 30.0) * 10) / 10.0 : 0;

        List<Long> medSpark = List.of(
                medecinsTotal - 4, medecinsTotal - 3, medecinsTotal - 3,
                medecinsTotal - 2, medecinsTotal - 2, medecinsTotal,
                medecinsTotal
        );

        // ── Carte 3 : Patients ───────────────────────────────────────────────
        long patientsTotal    = patientRepo.count();
        long patientsNouveaux = patientRepo.countCreatedBetween(startMonth, endMonth);
        long patsMoisPrec     = patientRepo.countCreatedBetween(
                startMonth.minusMonths(1), startMonth);
        String patsChange     = formatChange(patientsNouveaux, patsMoisPrec);

        long dossiersActifsCount   = dossierRepo.countByStatut(StatutDossierEnum.ACTIF);
        long dossiersArchivesCount = dossierRepo.countByStatut(StatutDossierEnum.ARCHIVE);

        long enfants = patientRepo.countEnfants();
        long adultes = patientRepo.countAdultes();
        long seniors = patientRepo.countSeniors();

        // Taux de rétention : patients actifs / total
        int retention = patientsTotal > 0
                ? (int) Math.round((dossiersActifsCount * 100.0) / patientsTotal) : 0;

        List<Long> patsSpark = buildPatientSpark(7);
        List<Long> patsParSemaine = buildPatientWeeklySpark(7);

        // ── Carte 4 : Dossiers (remplace Satisfaction) ───────────────────────
        long dossiersTotal       = dossierRepo.count();
        long dossiersCreésMois   = dossierRepo.countByStatutAndPeriod(
                StatutDossierEnum.ACTIF,
                startMonth.toLocalDate(), endMonth.toLocalDate());
        long dossiersTrimes      = dossierRepo.countByStatutAndPeriod(
                StatutDossierEnum.ACTIF,
                startMonth.minusMonths(3).toLocalDate(),
                endMonth.toLocalDate());
        long dossiersAvecExamen  = dossierRepo.countWithExamen();
        long dossMoisPrec        = dossierRepo.countByStatutAndPeriod(
                StatutDossierEnum.ACTIF,
                startMonth.minusMonths(1).toLocalDate(), startMonth.toLocalDate());
        String dossChange = formatChange(dossiersCreésMois, dossMoisPrec);

        int completion = dossiersTotal > 0
                ? (int) Math.round((dossiersAvecExamen * 100.0) / dossiersTotal) : 0;

        List<Long> dossSpark = buildDossierSpark(7);

        return DashboardStatsDTO.builder()
                // RDV
                .rdvDuJour(rdvDuJour)
                .rdvChange(rdvChange)
                .rdvSpark(rdvSpark)
                .rdvEffectues(effectues)
                .rdvEnAttente(enAttente)
                .rdvAnnules(annules)
                .rdvTauxCompletion(tauxCompletion)
                .rdvSemaine(rdvSemaine)
                .rdvMois(rdvMois)
                .rdvAnnulesMois(annulesMois)
                // Médecins
                .medecinsActifs(medecinsTotal)
                .medecinsChange(medChange)
                .medecinsSpark(medSpark)
                .medecinsGeneralistes(generalistes)
                .medecinsSpecialistes(specialistes)
                .medecinsRemplacants(0L)
                .medecinsDisponibilite(disponibilite)
                .consultationsParJour(consultParJour)
                .medecinsNouveaux(medNouveaux)
                .medecinsIndisponibles(medecinsTotal - medAvecRdv)
                .medecinsBySpecialite(bySpec)
                // Patients
                .patientsTotal(patientsTotal)
                .patientsChange(patsChange)
                .patientsSpark(patsSpark)
                .patientsActifs(dossiersActifsCount)
                .patientsArchives(dossiersArchivesCount)
                .patientsNouveauxMois(patientsNouveaux)
                .patientsTauxRetention(retention)
                .patientsAdultes(adultes)
                .patientsEnfants(enfants)
                .patientsSeniors(seniors)
                .patientsNouveauxParSemaine(patsParSemaine)
                // Dossiers
                .dossiersActifs(dossiersActifsCount)
                .dossiersChange(dossChange)
                .dossiersSpark(dossSpark)
                .dossiersEnCours(dossiersActifsCount)
                .dossiersArchives(dossiersArchivesCount)
                .dossiersCreésMois(dossiersCreésMois)
                .dossiersCompletion(completion)
                .dossiersCeMois(dossiersCreésMois)
                .dossiersTrimestre(dossiersTrimes)
                .dossiersAvecExamen(dossiersAvecExamen)
                .build();
    }

    // ── RDV MENSUEL ──────────────────────────────────────────────────────────
    private List<RdvMensuelDTO> buildRdvMensuel() {
        LocalDateTime from = LocalDateTime.now()
                .toLocalDate().withDayOfMonth(1).atStartOfDay().minusMonths(5);
        LocalDateTime to   = LocalDateTime.now()
                .toLocalDate().withDayOfMonth(1).atStartOfDay().plusMonths(1);

        List<Object[]> rows = rdvRepo.countByMonthAndStatut(from, to);

        // Map : mois → { effectues, attente }
        Map<Integer, long[]> map = new LinkedHashMap<>();
        for (int i = 5; i >= 0; i--) {
            int m = LocalDate.now().minusMonths(i).getMonthValue();
            map.put(m, new long[]{0L, 0L});
        }

        for (Object[] row : rows) {
            int month   = ((Number) row[0]).intValue();
            StatutRDVEnum statut = (StatutRDVEnum) row[1];
            long count  = ((Number) row[2]).longValue();
            if (map.containsKey(month)) {
                if (statut == StatutRDVEnum.EFFECTUE)   map.get(month)[0] += count;
                if (statut == StatutRDVEnum.EN_ATTENTE) map.get(month)[1] += count;
            }
        }

        return map.entrySet().stream()
                .map(e -> new RdvMensuelDTO(
                        Month.of(e.getKey())
                                .getDisplayName(TextStyle.SHORT, Locale.FRENCH),
                        e.getValue()[0],
                        e.getValue()[1]
                ))
                .collect(Collectors.toList());
    }

    // ── PATIENTS PAR MÉDECIN ─────────────────────────────────────────────────
    private List<PatientsMedecinDTO> buildPatientsByMedecin() {
        List<Object[]> rows = rdvRepo.countPatientsByMedecin();

        return rows.stream()
                .map(row -> {
                    UUID medecinId = (UUID) row[0];
                    long count     = ((Number) row[1]).longValue();
                    return medecinRepo.findById(medecinId)
                            .map(m -> new PatientsMedecinDTO(
                                    "Dr. " + m.getNom(), count))
                            .orElse(null);
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingLong(PatientsMedecinDTO::getPatients).reversed())
                .limit(5)
                .collect(Collectors.toList());
    }

    // ── SPÉCIALITÉS ──────────────────────────────────────────────────────────
    private List<SpecialiteStatDTO> buildSpecialites() {
        return medecinRepo.countBySpecialite().stream()
                .map(row -> new SpecialiteStatDTO(
                        (String) row[0],
                        ((Number) row[1]).longValue()
                ))
                .collect(Collectors.toList());
    }

    // ── DOSSIERS MENSUEL ─────────────────────────────────────────────────────
    private List<DossiersMensuelDTO> buildDossiersMensuel() {
        LocalDate from = LocalDate.now().withDayOfMonth(1).minusMonths(5);
        List<Object[]> rows = dossierRepo.countByMonthAndStatut(from);

        Map<Integer, long[]> map = new LinkedHashMap<>();
        for (int i = 5; i >= 0; i--) {
            int m = LocalDate.now().minusMonths(i).getMonthValue();
            map.put(m, new long[]{0L, 0L});
        }

        for (Object[] row : rows) {
            int month             = ((Number) row[0]).intValue();
            StatutDossierEnum st  = (StatutDossierEnum) row[1];
            long count            = ((Number) row[2]).longValue();
            if (map.containsKey(month)) {
                if (st == StatutDossierEnum.ACTIF)    map.get(month)[0] += count;
                if (st == StatutDossierEnum.ARCHIVE)  map.get(month)[1] += count;
            }
        }

        return map.entrySet().stream()
                .map(e -> new DossiersMensuelDTO(
                        Month.of(e.getKey())
                                .getDisplayName(TextStyle.SHORT, Locale.FRENCH),
                        e.getValue()[0],
                        e.getValue()[1]
                ))
                .collect(Collectors.toList());
    }

    // ── TOP MÉDECINS ─────────────────────────────────────────────────────────
    private List<MedecinPerformanceDTO> buildTopMedecins() {
        List<Medecin> medecins = medecinRepo.findAll();

        LocalDateTime now        = LocalDateTime.now();
        int currentMonth         = now.getMonthValue();
        int currentYear          = now.getYear();
        int prevMonth            = currentMonth == 1 ? 12 : currentMonth - 1;
        int prevYear             = currentMonth == 1 ? currentYear - 1 : currentYear;

        return medecins.stream().map(m -> {
                    long rdvCeMois  = rdvRepo.countByMedecinAndMonth(
                            m.getId(), currentMonth, currentYear);
                    long rdvPrevMois = rdvRepo.countByMedecinAndMonth(
                            m.getId(), prevMonth, prevYear);

                    long patients = patientRepo.findByMedecinActif(m.getId()).size();

                    int growth = rdvPrevMois > 0
                            ? (int) Math.round(((rdvCeMois - rdvPrevMois) * 100.0) / rdvPrevMois)
                            : (rdvCeMois > 0 ? 100 : 0);

                    String specialite = m.getSpecialite() != null
                            ? m.getSpecialite().getNom() : "N/A";

                    return new MedecinPerformanceDTO(
                            m.getId().toString(),
                            m.getNom(),
                            m.getPrenom(),
                            specialite,
                            patients,
                            rdvCeMois,
                            Math.max(0, growth)
                    );
                })
                .sorted(Comparator.comparingLong(MedecinPerformanceDTO::getRdvMois).reversed())
                .limit(6)
                .collect(Collectors.toList());
    }

    // ── SECRÉTAIRES ──────────────────────────────────────────────────────────
    private List<SecretaireStatsDTO> buildSecretaires() {
        LocalDateTime startMonth = LocalDateTime.now()
                .toLocalDate().withDayOfMonth(1).atStartOfDay();
        LocalDateTime endMonth   = startMonth.plusMonths(1);

        List<Object[]> rows = rdvRepo.countBySecretaireAndStatutThisMonth(
                startMonth, endMonth);

        // Map : secretaireId → { total, effectues }
        Map<UUID, long[]> map = new HashMap<>();
        for (Object[] row : rows) {
            UUID secId         = (UUID) row[0];
            StatutRDVEnum statut = (StatutRDVEnum) row[1];
            long count         = ((Number) row[2]).longValue();
            map.computeIfAbsent(secId, k -> new long[]{0L, 0L});
            map.get(secId)[0] += count; // total
            if (statut == StatutRDVEnum.EFFECTUE) map.get(secId)[1] += count;
        }

        return secretaireRepo.findAll().stream()
                .map(s -> {
                    long[] counts  = map.getOrDefault(s.getId(), new long[]{0L, 0L});
                    long total     = counts[0];
                    long done      = counts[1];
                    int taux       = total > 0
                            ? (int) Math.round((done * 100.0) / total) : 0;
                    return new SecretaireStatsDTO(
                            s.getId().toString(),
                            s.getNom(),
                            s.getPrenom(),
                            total,
                            taux,
                            "active"
                    );
                })
                .collect(Collectors.toList());
    }

    // ── HELPERS SPARK ────────────────────────────────────────────────────────
    private List<Long> buildDailySpark(int days) {
        return IntStream.rangeClosed(0, days - 1)
                .map(i -> days - 1 - i)
                .mapToObj(i -> {
                    LocalDateTime s = LocalDate.now().minusDays(i).atStartOfDay();
                    LocalDateTime e = s.plusDays(1);
                    return (long) rdvRepo.findByDateBetween(s, e).size();
                })
                .collect(Collectors.toList());
    }

    private List<Long> buildPatientSpark(int weeks) {
        return IntStream.rangeClosed(0, weeks - 1)
                .map(i -> weeks - 1 - i)
                .mapToObj(i -> {
                    LocalDateTime s = LocalDate.now()
                            .minusWeeks(i).with(java.time.DayOfWeek.MONDAY).atStartOfDay();
                    LocalDateTime e = s.plusWeeks(1);
                    return patientRepo.countCreatedBetween(s, e);
                })
                .collect(Collectors.toList());
    }

    private List<Long> buildPatientWeeklySpark(int weeks) {
        return buildPatientSpark(weeks);
    }

    private List<Long> buildDossierSpark(int months) {
        return IntStream.iterate(months - 1, i -> i >= 0, i -> i - 1)
                .mapToObj(i -> {
                    LocalDate s = LocalDate.now().withDayOfMonth(1).minusMonths(i);
                    LocalDate e = s.plusMonths(1);
                    return dossierRepo.countByStatutAndPeriod(StatutDossierEnum.ACTIF, s, e);
                })
                .collect(Collectors.toList());
    }

    // ── FORMAT CHANGE ─────────────────────────────────────────────────────────
    private String formatChange(long current, long previous) {
        if (previous == 0) return current > 0 ? "+100%" : "0%";
        long pct = Math.round(((current - previous) * 100.0) / previous);
        return (pct >= 0 ? "+" : "") + pct + "%";
    }
}