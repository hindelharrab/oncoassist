package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.entity.*;
import com.oncoassist.oncoassist.model.entity.enums.BIRADSEnum;
import com.oncoassist.oncoassist.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

// ── Ajouter ces imports en haut ───────────────
import com.oncoassist.oncoassist.model.dto.dashboard.DashboardSecretaireDTO;
import com.oncoassist.oncoassist.repository.NotificationRepository;
import com.oncoassist.oncoassist.repository.UtilisateurRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final MammographieRepository  mammographieRepository;
    private final RendezVousRepository    rendezVousRepository;
    private final PatientService          patientService;
    private final IRMRepository           irmRepository;
    private final EchographieRepository   echographieRepository;
    private final BiopsieRepository       biopsieRepository;
    private final ExamenManuelRepository  examenManuelRepository;
    // ── Ajouter ces champs dans la classe ─────────
    private final NotificationRepository  notificationRepository;
    private final UtilisateurRepository   utilisateurRepository;

    // ── KPI : Patientes actives ───────────────────
    public int getActivePatientsCount(UUID medecinId) {
        return patientService.findByMedecin(medecinId).size();
    }

    // ── KPI : Cas critiques ───────────────────────
    public int getCriticalCasesCount(UUID medecinId) {
        var patients = patientService.findByMedecin(medecinId);
        int criticalCount = 0;
        for (var patient : patients) {
            var dossier = patient.getDossierMedical();
            if (dossier != null && dossier.getExamens() != null) {
                boolean hasCritical = dossier.getExamens().stream()
                        .filter(e -> e instanceof Mammographie)
                        .map(e -> (Mammographie) e)
                        .anyMatch(m -> m.getScoreBIRADS() != null
                                && isCriticalBirads(m.getScoreBIRADS()));
                if (hasCritical) criticalCount++;
            }
        }
        return criticalCount;
    }

    private boolean isCriticalBirads(BIRADSEnum birads) {
        return birads == BIRADSEnum.BIRADS_4A
                || birads == BIRADSEnum.BIRADS_4B
                || birads == BIRADSEnum.BIRADS_4C
                || birads == BIRADSEnum.BIRADS_5
                || birads == BIRADSEnum.BIRADS_6;
    }

    // ── KPI : Examens IA cette semaine ────────────
    public int getIaExamsThisWeek() {
        LocalDateTime start = LocalDate.now()
                .with(java.time.DayOfWeek.MONDAY)
                .atStartOfDay();
        LocalDateTime end = start.plusDays(7);
        // Total tous types d'examens cette semaine
        return (int) (
                mammographieRepository.countByDateBetween(start, end) +
                        irmRepository.countByDateBetween(start, end) +
                        echographieRepository.countByDateBetween(start, end) +
                        biopsieRepository.countByDateBetween(start, end) +
                        examenManuelRepository.countByDateBetween(start, end)
        );
    }

    // ── KPI : RDV aujourd'hui ─────────────────────
    public long getRdvTodayCount(UUID medecinId) {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end   = start.plusDays(1);
        return rendezVousRepository.countByMedecinIdAndDateBetween(medecinId, start, end);
    }

    // ── Examens récents (top 5 tous types) ───────
    public List<Map<String, Object>> getRecentExams() {
        List<Map<String, Object>> allExams = new ArrayList<>();

        // Mammographies
        mammographieRepository.findTop5ByOrderByDateDesc().forEach(m -> {
            Map<String, Object> exam = new HashMap<>();
            exam.put("id",      m.getId());
            exam.put("patient", getPatientFromMammo(m));
            exam.put("type",    "Mammographie");
            exam.put("birads",  getBiradsDisplay(m.getScoreBIRADS()));
            exam.put("time",    getRelativeTime(m.getDate()));
            exam.put("status",  getStatusFromBirads(m.getScoreBIRADS()));
            exam.put("date",    m.getDate());
            allExams.add(exam);
        });

        // IRM
        irmRepository.findTop5ByOrderByDateDesc().forEach(i -> {
            Map<String, Object> exam = new HashMap<>();
            exam.put("id",      i.getId());
            exam.put("patient", getPatientFromDossier(i.getDossierMedical()));
            exam.put("type",    "IRM");
            exam.put("birads",  i.getScoreBIRADS() != null
                    ? i.getScoreBIRADS().name().replace("BIRADS_", "") : "N/A");
            exam.put("time",    getRelativeTime(i.getDate()));
            exam.put("status",  getStatusFromBirads(i.getScoreBIRADS()));
            exam.put("date",    i.getDate());
            allExams.add(exam);
        });

        // Échographies
        echographieRepository.findTop5ByOrderByDateDesc().forEach(e -> {
            Map<String, Object> exam = new HashMap<>();
            exam.put("id",      e.getId());
            exam.put("patient", getPatientFromDossier(e.getDossierMedical()));
            exam.put("type",    "Échographie");
            exam.put("birads",  e.getScoreBIRADS() != null
                    ? e.getScoreBIRADS().name().replace("BIRADS_", "") : "N/A");
            exam.put("time",    getRelativeTime(e.getDate()));
            exam.put("status",  getStatusFromBirads(e.getScoreBIRADS()));
            exam.put("date",    e.getDate());
            allExams.add(exam);
        });

        // Biopsies
        biopsieRepository.findTop5ByOrderByDateDesc().forEach(b -> {
            Map<String, Object> exam = new HashMap<>();
            exam.put("id",      b.getId());
            exam.put("patient", getPatientFromDossier(b.getDossierMedical()));
            exam.put("type",    "Biopsie");
            exam.put("birads",  "—");
            exam.put("time",    getRelativeTime(b.getDate()));
            exam.put("status",  "normal");
            exam.put("date",    b.getDate());
            allExams.add(exam);
        });

        // Examens manuels (consultations)
        examenManuelRepository.findTop5ByOrderByDateDesc().forEach(e -> {
            Map<String, Object> exam = new HashMap<>();
            exam.put("id",      e.getId());
            exam.put("patient", getPatientFromDossier(e.getDossierMedical()));
            exam.put("type",    "Consultation");
            exam.put("birads",  "—");
            exam.put("time",    getRelativeTime(e.getDate()));
            exam.put("status",  "normal");
            exam.put("date",    e.getDate());
            allExams.add(exam);
        });

        // Trier par date desc et garder les 5 plus récents
        return allExams.stream()
                .sorted(Comparator.comparing(
                        e -> ((LocalDateTime) e.get("date")),
                        Comparator.reverseOrder()
                ))
                .limit(5)
                .peek(e -> e.remove("date")) // retirer la clé date du résultat final
                .collect(Collectors.toList());
    }

    // ── Répartition BI-RADS (inchangée) ──────────
    public List<Map<String, Object>> getBiradsDistribution() {
        List<Object[]> results = mammographieRepository.getBiradsDistribution();

        Map<String, Integer> distribution = new LinkedHashMap<>();
        distribution.put("Normaux (1-2)",    0);
        distribution.put("À surveiller (3)", 0);
        distribution.put("Suspects (4)",     0);
        distribution.put("Malins (5-6)",     0);

        for (Object[] row : results) {
            BIRADSEnum birads = (BIRADSEnum) row[0];
            Long count        = (Long) row[1];
            if (birads == BIRADSEnum.BIRADS_1 || birads == BIRADSEnum.BIRADS_2) {
                distribution.merge("Normaux (1-2)", count.intValue(), Integer::sum);
            } else if (birads == BIRADSEnum.BIRADS_3) {
                distribution.merge("À surveiller (3)", count.intValue(), Integer::sum);
            } else if (birads == BIRADSEnum.BIRADS_4A
                    || birads == BIRADSEnum.BIRADS_4B
                    || birads == BIRADSEnum.BIRADS_4C) {
                distribution.merge("Suspects (4)", count.intValue(), Integer::sum);
            } else if (birads == BIRADSEnum.BIRADS_5 || birads == BIRADSEnum.BIRADS_6) {
                distribution.merge("Malins (5-6)", count.intValue(), Integer::sum);
            }
        }

        int total = distribution.values().stream().mapToInt(Integer::intValue).sum();
        String[] colors = { "#10b981", "#f59e0b", "#ef4444", "#991b1b" };

        List<Map<String, Object>> result = new ArrayList<>();
        int idx = 0;
        for (Map.Entry<String, Integer> entry : distribution.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("name",  entry.getKey());
            item.put("value", total > 0 ? (entry.getValue() * 100 / total) : 0);
            item.put("color", colors[idx++]);
            result.add(item);
        }
        return result;
    }

    // ── Évolution examens par mois — TOUS TYPES ──
    public List<Map<String, Object>> getExamsEvolution() {
        LocalDateTime now = LocalDateTime.now();
        List<Map<String, Object>> evolution = new ArrayList<>();

        for (int i = 4; i >= 0; i--) {
            LocalDateTime start = now.minusMonths(i)
                    .withDayOfMonth(1).toLocalDate().atStartOfDay();
            LocalDateTime end = start.plusMonths(1);

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("mois",  getMonthShortName(start));
            monthData.put("mammo", mammographieRepository.countByDateBetween(start, end));
            monthData.put("irm",   irmRepository.countByDateBetween(start, end));
            monthData.put("echo",  echographieRepository.countByDateBetween(start, end));
            monthData.put("biopsie",    biopsieRepository.countByDateBetween(start, end));
            monthData.put("consultation", examenManuelRepository.countByDateBetween(start, end));
            evolution.add(monthData);
        }
        return evolution;
    }

    // ── RDV aujourd'hui (inchangé) ────────────────
    public List<Map<String, Object>> getTodayAppointments(UUID medecinId) {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end   = start.plusDays(1);

        return rendezVousRepository
                .findByMedecinIdAndDateBetween(medecinId, start, end)
                .stream()
                .map(rdv -> {
                    Map<String, Object> apt = new HashMap<>();
                    apt.put("time", rdv.getDate() != null
                            ? rdv.getDate().format(DateTimeFormatter.ofPattern("HH:mm"))
                            : "À définir");
                    apt.put("patient", rdv.getPatient() != null
                            ? rdv.getPatient().getPrenom() + " " + rdv.getPatient().getNom()
                            : "N/A");
                    apt.put("reason", rdv.getMotif() != null ? rdv.getMotif() : "Consultation");
                    return apt;
                })
                .collect(Collectors.toList());
    }

    // ── Activité hebdomadaire — TOUS TYPES ────────
    public List<Map<String, Object>> getWeeklyActivity() {
        LocalDateTime startOfWeek = LocalDate.now()
                .with(java.time.DayOfWeek.MONDAY).atStartOfDay();

        String[] days   = { "Lun","Mar","Mer","Jeu","Ven","Sam","Dim" };
        String[] colors = { "#818cf8","#6366f1","#4f46e5","#4338ca","#3730a3","#4f46e5","#6366f1" };

        List<Map<String, Object>> weekly = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDateTime dayStart = startOfWeek.plusDays(i);
            LocalDateTime dayEnd   = dayStart.plusDays(1);

            long total =
                    mammographieRepository.countByDateBetween(dayStart, dayEnd) +
                            irmRepository.countByDateBetween(dayStart, dayEnd) +
                            echographieRepository.countByDateBetween(dayStart, dayEnd) +
                            biopsieRepository.countByDateBetween(dayStart, dayEnd) +
                            examenManuelRepository.countByDateBetween(dayStart, dayEnd);

            Map<String, Object> dayData = new HashMap<>();
            dayData.put("jour",    days[i]);
            dayData.put("examens", total);
            dayData.put("color",   colors[i]);
            weekly.add(dayData);
        }
        return weekly;
    }

    // ── Utilitaires privés ────────────────────────
    private String getPatientFromMammo(Mammographie m) {
        if (m.getDossierMedical() != null && m.getDossierMedical().getPatient() != null) {
            return m.getDossierMedical().getPatient().getPrenom()
                    + " " + m.getDossierMedical().getPatient().getNom();
        }
        return "Inconnu";
    }

    private String getPatientFromDossier(DossierMedical dossier) {
        if (dossier != null && dossier.getPatient() != null) {
            return dossier.getPatient().getPrenom()
                    + " " + dossier.getPatient().getNom();
        }
        return "Inconnu";
    }

    private String getBiradsDisplay(BIRADSEnum birads) {
        if (birads == null) return "N/A";
        return birads.name().replace("BIRADS_", "");
    }

    private String getRelativeTime(LocalDateTime date) {
        if (date == null) return "Date inconnue";
        long hours = java.time.Duration.between(date, LocalDateTime.now()).toHours();
        if (hours < 1)  return "Il y a quelques minutes";
        if (hours < 24) return "Il y a " + hours + "h";
        return "Il y a " + (hours / 24) + " jours";
    }

    private String getStatusFromBirads(BIRADSEnum birads) {
        if (birads == null) return "normal";
        if (isCriticalBirads(birads)) return "critical";
        if (birads == BIRADSEnum.BIRADS_3) return "warning";
        return "normal";
    }

    private String getMonthShortName(LocalDateTime date) {
        String[] months = { "Jan","Fév","Mar","Avr","Mai","Juin","Juil","Aoû","Sep","Oct","Nov","Déc" };
        return months[date.getMonthValue() - 1];
    }

}