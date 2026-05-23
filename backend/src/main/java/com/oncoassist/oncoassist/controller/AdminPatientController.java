package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.dto.admin.AdminPatientDetailDTO;
import com.oncoassist.oncoassist.service.AdminPatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/patients")
@RequiredArgsConstructor
public class AdminPatientController {

    private final AdminPatientService adminPatientService;

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<AdminPatientDetailDTO>> findAll() {
        return ResponseEntity.ok(adminPatientService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<AdminPatientDetailDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(adminPatientService.findById(id));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<AdminPatientDetailDTO>> rechercher(@RequestParam String nom) {
        return ResponseEntity.ok(adminPatientService.rechercher(nom));
    }
}