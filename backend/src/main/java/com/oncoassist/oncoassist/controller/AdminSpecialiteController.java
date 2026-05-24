package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.dto.admin.AdminSpecialiteDTO;
import com.oncoassist.oncoassist.model.entity.Specialite;
import com.oncoassist.oncoassist.service.AdminSpecialiteService;
import com.oncoassist.oncoassist.service.SpecialiteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/specialites")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminSpecialiteController {

    private final AdminSpecialiteService adminSpecialiteService;
    private final SpecialiteService      specialiteService;

    @GetMapping
    public ResponseEntity<List<AdminSpecialiteDTO>> findAll() {
        return ResponseEntity.ok(adminSpecialiteService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminSpecialiteDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(adminSpecialiteService.findById(id));
    }

    @PostMapping
    public ResponseEntity<AdminSpecialiteDTO> creer(@RequestBody Specialite specialite) {
        Specialite saved = specialiteService.creer(specialite);
        return ResponseEntity.ok(adminSpecialiteService.findById(saved.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminSpecialiteDTO> modifier(
            @PathVariable UUID id,
            @RequestBody Specialite specialite) {
        specialiteService.modifier(id, specialite);
        return ResponseEntity.ok(adminSpecialiteService.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable UUID id) {
        specialiteService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}