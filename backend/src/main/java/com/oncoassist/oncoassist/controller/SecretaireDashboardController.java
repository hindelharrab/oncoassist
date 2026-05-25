package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.dto.SecretaireDashboardDTO;
import com.oncoassist.oncoassist.service.SecretaireDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/secretaire/dashboard")
@RequiredArgsConstructor
public class SecretaireDashboardController {

    private final SecretaireDashboardService dashboardService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('SECRETAIRE', 'ADMIN')")
    public ResponseEntity<SecretaireDashboardDTO> getDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                dashboardService.getDashboard(userDetails.getUsername())
        );
    }
}