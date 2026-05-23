package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.dto.admin.DashboardOverviewDTO;
import com.oncoassist.oncoassist.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService admindashboardService;
    @GetMapping("/overview")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<DashboardOverviewDTO> getOverview() {
        return ResponseEntity.ok(admindashboardService.getOverview());
    }
}