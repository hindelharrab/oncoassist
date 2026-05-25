package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.dto.SecretairePrintPatientDTO;
import com.oncoassist.oncoassist.service.SecretairePrintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/secretaire/print")
@RequiredArgsConstructor
public class SecretairePrintController {

    private final SecretairePrintService printService;

    @GetMapping("/patients")
    @PreAuthorize("hasAnyAuthority('SECRETAIRE', 'ADMIN')")
    public ResponseEntity<List<SecretairePrintPatientDTO>> getPatients(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                printService.getPatientsDeSpecialite(userDetails.getUsername())
        );
    }

    @GetMapping("/patients/{patientId}/rapport")
    @PreAuthorize("hasAnyAuthority('SECRETAIRE', 'ADMIN')")
    public ResponseEntity<String> getRapportFinal(
            @PathVariable UUID patientId) {
        return ResponseEntity.ok(
                printService.getRapportFinalJson(patientId)
        );
    }
}