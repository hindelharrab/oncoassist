package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.entity.DossierMedical;
import com.oncoassist.oncoassist.model.entity.Patient;
import com.oncoassist.oncoassist.model.entity.enums.RoleEnum;
import com.oncoassist.oncoassist.model.entity.enums.StatutDossierEnum;
import com.oncoassist.oncoassist.repository.DossierMedicalRepository;
import com.oncoassist.oncoassist.repository.PatientRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final DossierMedicalRepository dossierMedicalRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public Patient creer(Patient patient) {
        if (patientRepository.existsByEmail(patient.getEmail())) {
            throw new IllegalArgumentException("Email déjà utilisé : " + patient.getEmail());
        }
        patient.setRole(RoleEnum.PATIENT);
        Patient saved = patientRepository.save(patient);

        // Création automatique du dossier médical
        DossierMedical dossier = new DossierMedical();
        dossier.setPatient(saved);
        dossier.setDateCreation(LocalDate.now());
        dossier.setStatut(StatutDossierEnum.ACTIF);
        dossierMedicalRepository.save(dossier);

        return saved;
    }

    public List<Patient> findAll() {
        return patientRepository.findAll();
    }

    public Patient findById(UUID id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Patient non trouvé : " + id));
    }

    public List<Patient> rechercher(String nom) {
        return patientRepository.findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(nom, nom);
    }

    public List<Patient> findByMedecin(UUID medecinId) {
        return patientRepository.findByMedecinActif(medecinId);
    }

    public Patient modifier(UUID id, Patient data, MultipartFile photo) throws IOException {
        Patient patient = findById(id);
        patient.setNom(data.getNom());
        patient.setPrenom(data.getPrenom());
        patient.setTelephone(data.getTelephone());
        patient.setAdresse(data.getAdresse());
        patient.setDateNaissance(data.getDateNaissance());
        patient.setPersonneConfiance(data.getPersonneConfiance());

        if (photo != null && !photo.isEmpty()) {
            fileStorageService.supprimerPhoto(patient.getPhotoProfil());
            patient.setPhotoProfil(fileStorageService.sauvegarderPhoto(photo));
        }

        return patientRepository.save(patient);
    }

    public void supprimer(UUID id) {
        patientRepository.delete(findById(id));
    }
}