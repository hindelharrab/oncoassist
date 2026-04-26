package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.entity.Specialite;
import com.oncoassist.oncoassist.service.SpecialiteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/specialites")
@RequiredArgsConstructor
public class SpecialiteController {

    private final SpecialiteService specialiteService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Specialite> creer(@RequestBody Specialite specialite) {
        return ResponseEntity.ok(specialiteService.creer(specialite));
    }

    @GetMapping
    public ResponseEntity<List<Specialite>> findAll() {
        return ResponseEntity.ok(specialiteService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Specialite> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(specialiteService.findById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Specialite> modifier(@PathVariable UUID id, @RequestBody Specialite specialite) {
        return ResponseEntity.ok(specialiteService.modifier(id, specialite));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> supprimer(@PathVariable UUID id) {
        specialiteService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
