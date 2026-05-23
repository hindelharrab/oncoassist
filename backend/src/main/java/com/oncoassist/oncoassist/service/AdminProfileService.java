package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.admin.AdminProfileDTO;
import com.oncoassist.oncoassist.model.dto.admin.UpdatePasswordRequest;
import com.oncoassist.oncoassist.model.dto.admin.UpdateProfileRequest;
import com.oncoassist.oncoassist.model.entity.Utilisateur;
import com.oncoassist.oncoassist.repository.MedecinRepository;
import com.oncoassist.oncoassist.repository.PatientRepository;
import com.oncoassist.oncoassist.repository.RendezVousRepository;
import com.oncoassist.oncoassist.repository.SecretaireRepository;
import com.oncoassist.oncoassist.repository.UtilisateurRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminProfileService {

    private final UtilisateurRepository utilisateurRepo;
    private final MedecinRepository     medecinRepo;
    private final SecretaireRepository  secretaireRepo;
    private final PatientRepository     patientRepo;
    private final RendezVousRepository  rdvRepo;
    private final PasswordEncoder       passwordEncoder;
    private final FileStorageService    fileStorageService;

    public AdminProfileDTO getProfile(UUID adminId) {
        Utilisateur admin = utilisateurRepo.findById(adminId)
                .orElseThrow(() -> new EntityNotFoundException("Admin introuvable"));

        long totalMedecins    = medecinRepo.count();
        long totalSecretaires = secretaireRepo.count();
        long totalPatients    = patientRepo.count();
        long totalRdv         = rdvRepo.count();
        long totalMembres     = totalMedecins + totalSecretaires;

        return AdminProfileDTO.builder()
                .id(admin.getId())
                .nom(admin.getNom())
                .prenom(admin.getPrenom())
                .email(admin.getEmail())
                .telephone(admin.getTelephone())
                .photoProfil(admin.getPhotoProfil())
                .totalRdv(totalRdv)
                .totalMembres(totalMembres)
                .totalPatients(totalPatients)
                .totalMedecins(totalMedecins)
                .totalSecretaires(totalSecretaires)
                .build();
    }

    @Transactional
    public AdminProfileDTO updateProfile(UUID adminId, UpdateProfileRequest req) {
        Utilisateur admin = utilisateurRepo.findById(adminId)
                .orElseThrow(() -> new EntityNotFoundException("Admin introuvable"));

        if (req.getNom()       != null) admin.setNom(req.getNom());
        if (req.getPrenom()    != null) admin.setPrenom(req.getPrenom());
        if (req.getTelephone() != null) admin.setTelephone(req.getTelephone());

        utilisateurRepo.save(admin);
        return getProfile(adminId);
    }

    @Transactional
    public void updatePassword(UUID adminId, UpdatePasswordRequest req) {
        Utilisateur admin = utilisateurRepo.findById(adminId)
                .orElseThrow(() -> new EntityNotFoundException("Admin introuvable"));

        if (!passwordEncoder.matches(req.getMotDePasseActuel(), admin.getMotDePasse())) {
            throw new IllegalArgumentException("Mot de passe actuel incorrect");
        }

        admin.setMotDePasse(passwordEncoder.encode(req.getNouveauMotDePasse()));
        utilisateurRepo.save(admin);
    }

    @Transactional
    public AdminProfileDTO updatePhoto(UUID adminId, MultipartFile photo) throws IOException {
        Utilisateur admin = utilisateurRepo.findById(adminId)
                .orElseThrow(() -> new EntityNotFoundException("Admin introuvable"));

        // Supprimer l'ancienne photo si elle existe
        if (admin.getPhotoProfil() != null) {
            fileStorageService.supprimerPhoto(admin.getPhotoProfil());
        }

        String chemin = fileStorageService.sauvegarderPhoto(photo);
        admin.setPhotoProfil(chemin);
        utilisateurRepo.save(admin);
        return getProfile(adminId);
    }
}