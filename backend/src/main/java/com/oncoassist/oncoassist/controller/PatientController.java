package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.dto.PatientDetailDTO;
import com.oncoassist.oncoassist.model.dto.PatientListItemDTO;
import com.oncoassist.oncoassist.model.entity.Patient;
import com.oncoassist.oncoassist.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.oncoassist.oncoassist.model.dto.PatientRequestDTO;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SECRETAIRE', 'ADMIN')")
    public ResponseEntity<PatientDetailDTO> creer(@RequestBody PatientRequestDTO dto) {
        Patient patient = patientService.creer(dto);

        // Convertir en DTO pour la réponse
        PatientDetailDTO response = new PatientDetailDTO();
        response.setId(patient.getId());
        response.setNom(patient.getNom());
        response.setPrenom(patient.getPrenom());
        response.setEmail(patient.getEmail());
        response.setTelephone(patient.getTelephone());
        response.setDateNaissance(patient.getDateNaissance());
        response.setAdresse(patient.getAdresse());
        response.setPersonneConfiance(patient.getPersonneConfiance());
        response.setPhotoProfil(patient.getPhotoProfil());
        response.setRole(patient.getRole().name());
        if (patient.getDossierMedical() != null) {
            response.setDossierMedicalId(patient.getDossierMedical().getId());
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MEDECIN', 'SECRETAIRE', 'ADMIN')")
    public ResponseEntity<List<PatientDetailDTO>> findAll() {
        return ResponseEntity.ok(patientService.findAll());
    }
    @GetMapping("/{id}")
    public ResponseEntity<PatientDetailDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(patientService.findByIdDetail(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Patient>> rechercher(@RequestParam String nom) {
        return ResponseEntity.ok(patientService.rechercher(nom));
    }

    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<List<Patient>> findByMedecin(@PathVariable UUID medecinId) {
        return ResponseEntity.ok(patientService.findByMedecin(medecinId));
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Patient> modifier(
            @PathVariable UUID id,
            @RequestPart("data") Patient patient,
            @RequestPart(value = "photo", required = false) MultipartFile photo) throws IOException {

        return ResponseEntity.ok(patientService.modifier(id, patient, photo));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> supprimer(@PathVariable UUID id) {
        patientService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/medecin/{medecinId}/avec-statut")
    @PreAuthorize("hasRole('MEDECIN')")
    public ResponseEntity<List<PatientListItemDTO>> findPatientsAvecStatut(
            @PathVariable UUID medecinId) {
        return ResponseEntity.ok(patientService.findByMedecinAvecStatut(medecinId));
    }
}