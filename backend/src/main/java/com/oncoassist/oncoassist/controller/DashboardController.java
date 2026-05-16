package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.entity.Medecin;
import com.oncoassist.oncoassist.service.DashboardService;
import com.oncoassist.oncoassist.service.MedecinService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final MedecinService medecinService;

    // Récupérer le médecin connecté
    private UUID getCurrentMedecinId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Medecin medecin = medecinService.findByEmail(email);
        return medecin.getId();
    }

    // ─────────────────────────────────────────────────────────
    // Endpoint principal — toutes les données du dashboard
    // ─────────────────────────────────────────────────────────
    @GetMapping("/data")
    public ResponseEntity<Map<String, Object>> getDashboardData() {
        UUID medecinId = getCurrentMedecinId();

        Map<String, Object> dashboardData = new HashMap<>();

        // KPI
        Map<String, Object> kpis = new HashMap<>();
        kpis.put("activePatients", dashboardService.getActivePatientsCount(medecinId));
        kpis.put("criticalCases", dashboardService.getCriticalCasesCount(medecinId));
        kpis.put("iaExamsThisWeek", dashboardService.getIaExamsThisWeek());
        kpis.put("rdvToday", dashboardService.getRdvTodayCount(medecinId));
        dashboardData.put("kpis", kpis);

        // Graphiques
        dashboardData.put("biradsDistribution", dashboardService.getBiradsDistribution());
        dashboardData.put("examsEvolution", dashboardService.getExamsEvolution());
        dashboardData.put("weeklyActivity", dashboardService.getWeeklyActivity());

        // Listes
        dashboardData.put("recentExams", dashboardService.getRecentExams());
        dashboardData.put("todayAppointments", dashboardService.getTodayAppointments(medecinId));

        return ResponseEntity.ok(dashboardData);
    }
}