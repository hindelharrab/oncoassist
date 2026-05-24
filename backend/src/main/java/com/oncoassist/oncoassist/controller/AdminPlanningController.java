package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.dto.admin.PlanningOverviewDTO;
import com.oncoassist.oncoassist.service.AdminPlanningService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/planning")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminPlanningController {

    private final AdminPlanningService planningService;

    // GET /api/admin/planning/semaine?medecinId=xxx&dateDebut=2024-05-20
    @GetMapping("/semaine")
    public ResponseEntity<PlanningOverviewDTO> getSemaine(
            @RequestParam(required = false) UUID medecinId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut
    ) {
        return ResponseEntity.ok(planningService.getSemaine(medecinId, dateDebut));
    }

    // GET /api/admin/planning/jour?medecinId=xxx&date=2024-05-20
    @GetMapping("/jour")
    public ResponseEntity<PlanningOverviewDTO> getJour(
            @RequestParam(required = false) UUID medecinId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(planningService.getJour(medecinId, date));
    }

    // GET /api/admin/planning/mois?medecinId=xxx&year=2024&month=5
    @GetMapping("/mois")
    public ResponseEntity<PlanningOverviewDTO> getMois(
            @RequestParam(required = false) UUID medecinId,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return ResponseEntity.ok(planningService.getMois(medecinId, year, month));
    }
}