package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.entity.Mammographie;
import com.oncoassist.oncoassist.model.entity.RendezVous;
import com.oncoassist.oncoassist.model.entity.enums.BIRADSEnum;
import com.oncoassist.oncoassist.repository.MammographieRepository;
import com.oncoassist.oncoassist.repository.RendezVousRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;  // ← Spring, pas Jakarta

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)  // ← sur toute la classe
public class DashboardService {

    private final MammographieRepository mammographieRepository;
    private final RendezVousRepository   rendezVousRepository;
    private final PatientService         patientService;

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
        return (int) mammographieRepository
                .countByDateBetween(start, end);
    }

    // ── KPI : RDV aujourd'hui ─────────────────────
    public long getRdvTodayCount(UUID medecinId) {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end   = start.plusDays(1);
        return rendezVousRepository
                .countByMedecinIdAndDateBetween(
                        medecinId, start, end
                );
    }

    // ── Examens récents (top 5) ───────────────────
    public List<Map<String, Object>> getRecentExams() {
        return mammographieRepository
                .findTop5ByOrderByDateDesc()
                .stream()
                .map(m -> {
                    Map<String, Object> exam = new HashMap<>();
                    exam.put("id",      m.getId());
                    exam.put("patient", getPatientFullName(m));
                    exam.put("type",    "Mammographie");
                    exam.put("birads",  getBiradsDisplay(
                            m.getScoreBIRADS()
                    ));
                    exam.put("time",    getRelativeTime(
                            m.getDate()
                    ));
                    exam.put("status",  getStatusFromBirads(
                            m.getScoreBIRADS()
                    ));
                    return exam;
                })
                .collect(Collectors.toList());
    }

    // ── Répartition BI-RADS ───────────────────────
    public List<Map<String, Object>> getBiradsDistribution() {
        List<Object[]> results =
                mammographieRepository.getBiradsDistribution();

        Map<String, Integer> distribution = new LinkedHashMap<>();
        distribution.put("Normaux (1-2)",     0);
        distribution.put("À surveiller (3)",  0);
        distribution.put("Suspects (4)",      0);
        distribution.put("Malins (5-6)",      0);

        for (Object[] row : results) {
            BIRADSEnum birads = (BIRADSEnum) row[0];
            Long count        = (Long) row[1];
            if (birads == BIRADSEnum.BIRADS_1
                    || birads == BIRADSEnum.BIRADS_2) {
                distribution.merge("Normaux (1-2)",
                        count.intValue(), Integer::sum);
            } else if (birads == BIRADSEnum.BIRADS_3) {
                distribution.merge("À surveiller (3)",
                        count.intValue(), Integer::sum);
            } else if (birads == BIRADSEnum.BIRADS_4A
                    || birads == BIRADSEnum.BIRADS_4B
                    || birads == BIRADSEnum.BIRADS_4C) {
                distribution.merge("Suspects (4)",
                        count.intValue(), Integer::sum);
            } else if (birads == BIRADSEnum.BIRADS_5
                    || birads == BIRADSEnum.BIRADS_6) {
                distribution.merge("Malins (5-6)",
                        count.intValue(), Integer::sum);
            }
        }

        int total = distribution.values().stream()
                .mapToInt(Integer::intValue).sum();

        List<Map<String, Object>> result = new ArrayList<>();
        String[] colors = {
                "#10b981", "#f59e0b", "#ef4444", "#991b1b"
        };
        int idx = 0;
        for (Map.Entry<String, Integer> entry
                : distribution.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("name",  entry.getKey());
            item.put("value", total > 0
                    ? (entry.getValue() * 100 / total)
                    : 0);
            item.put("color", colors[idx++]);
            result.add(item);
        }
        return result;
    }

    // ── Évolution examens par mois ────────────────
    public List<Map<String, Object>> getExamsEvolution() {
        LocalDateTime now = LocalDateTime.now();
        List<Map<String, Object>> evolution = new ArrayList<>();

        for (int i = 4; i >= 0; i--) {
            LocalDateTime start = now.minusMonths(i)
                    .withDayOfMonth(1)
                    .toLocalDate()
                    .atStartOfDay();
            LocalDateTime end = start.plusMonths(1);

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("mois",  getMonthShortName(start));
            monthData.put("mammo",
                    mammographieRepository
                            .countByDateBetween(start, end));
            monthData.put("irm",  0);
            monthData.put("echo", 0);
            evolution.add(monthData);
        }
        return evolution;
    }

    // ── RDV aujourd'hui (détail) ──────────────────
    public List<Map<String, Object>> getTodayAppointments(
            UUID medecinId) {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end   = start.plusDays(1);

        return rendezVousRepository
                .findByMedecinIdAndDateBetween(
                        medecinId, start, end
                )
                .stream()
                .map(rdv -> {
                    Map<String, Object> apt = new HashMap<>();
                    apt.put("time", rdv.getDate() != null
                            ? rdv.getDate().format(
                            DateTimeFormatter
                                    .ofPattern("HH:mm"))
                            : "À définir");
                    apt.put("patient",
                            rdv.getPatient() != null
                                    ? rdv.getPatient().getPrenom()
                                    + " " + rdv.getPatient().getNom()
                                    : "N/A");
                    apt.put("reason",
                            rdv.getMotif() != null
                                    ? rdv.getMotif()
                                    : "Consultation");
                    return apt;
                })
                .collect(Collectors.toList());
    }

    // ── Activité hebdomadaire ─────────────────────
    public List<Map<String, Object>> getWeeklyActivity() {
        LocalDateTime startOfWeek = LocalDate.now()
                .with(java.time.DayOfWeek.MONDAY)
                .atStartOfDay();

        List<Map<String, Object>> weekly = new ArrayList<>();
        String[] days   = {
                "Lun","Mar","Mer","Jeu","Ven","Sam","Dim"
        };
        String[] colors = {
                "#818cf8","#6366f1","#4f46e5",
                "#4338ca","#3730a3","#4f46e5","#6366f1"
        };

        for (int i = 0; i < 7; i++) {
            LocalDateTime dayStart = startOfWeek.plusDays(i);
            LocalDateTime dayEnd   = dayStart.plusDays(1);

            Map<String, Object> dayData = new HashMap<>();
            dayData.put("jour",    days[i]);
            dayData.put("examens",
                    mammographieRepository
                            .countByDateBetween(dayStart, dayEnd));
            dayData.put("color", colors[i]);
            weekly.add(dayData);
        }
        return weekly;
    }

    // ── Utilitaires privés ────────────────────────
    private String getPatientFullName(Mammographie m) {
        if (m.getDossierMedical() != null
                && m.getDossierMedical().getPatient() != null) {
            return m.getDossierMedical().getPatient().getPrenom()
                    + " "
                    + m.getDossierMedical().getPatient().getNom();
        }
        return "Inconnu";
    }

    private String getBiradsDisplay(BIRADSEnum birads) {
        if (birads == null) return "N/A";
        return birads.name().replace("BIRADS_", "");
    }

    private String getRelativeTime(LocalDateTime date) {
        if (date == null) return "Date inconnue";
        long hours = java.time.Duration
                .between(date, LocalDateTime.now())
                .toHours();
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
        String[] months = {
                "Jan","Fév","Mar","Avr","Mai","Juin",
                "Juil","Aoû","Sep","Oct","Nov","Déc"
        };
        return months[date.getMonthValue() - 1];
    }
}