package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.*;
import com.oncoassist.oncoassist.model.entity.Medecin;
import com.oncoassist.oncoassist.model.entity.Specialite;
import com.oncoassist.oncoassist.repository.MedecinRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MedecinService {

    private final MedecinRepository medecinRepository;
    private final SpecialiteService specialiteService;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;

    public Medecin creer(Medecin medecin, UUID specialiteId) {
        if (medecinRepository.existsByEmail(medecin.getEmail())) {
            throw new IllegalArgumentException("Email déjà utilisé : " + medecin.getEmail());
        }

        if (medecin.getNumeroOrdre() != null && medecinRepository.existsByNumeroOrdre(medecin.getNumeroOrdre())) {
            throw new IllegalArgumentException("Numéro d'ordre déjà utilisé");
        }

        Specialite specialite = specialiteService.findById(specialiteId);
        medecin.setSpecialite(specialite);

        // 🔐 Chiffrement du mot de passe
        medecin.setMotDePasse(passwordEncoder.encode(medecin.getMotDePasse()));

        return medecinRepository.save(medecin);
    }

    public List<Medecin> findAll() {
        return medecinRepository.findAll();
    }

    public Medecin findById(UUID id) {
        return medecinRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Médecin non trouvé : " + id));
    }

    public List<Medecin> findBySpecialite(UUID specialiteId) {
        return medecinRepository.findBySpecialiteId(specialiteId);
    }

    public Medecin modifier(UUID id, Medecin data, UUID specialiteId, MultipartFile photo) throws IOException {
        Medecin medecin = findById(id);
        medecin.setNom(data.getNom());
        medecin.setPrenom(data.getPrenom());
        medecin.setTelephone(data.getTelephone());
        medecin.setNumeroOrdre(data.getNumeroOrdre());

        if (specialiteId != null) {
            medecin.setSpecialite(specialiteService.findById(specialiteId));
        }

        if (photo != null && !photo.isEmpty()) {
            fileStorageService.supprimerPhoto(medecin.getPhotoProfil());
            medecin.setPhotoProfil(fileStorageService.sauvegarderPhoto(photo));
        }
        if (data.getMotDePasse() != null && !data.getMotDePasse().isBlank()) {
            medecin.setMotDePasse(passwordEncoder.encode(data.getMotDePasse()));
        }

        return medecinRepository.save(medecin);
    }
    public void supprimer(UUID id) {
        medecinRepository.delete(findById(id));
    }
    // Modifier son propre profil
    public Medecin modifierProfil(UUID id, MedecinProfilDTO data, MultipartFile photo)
            throws IOException {
        Medecin medecin = findById(id);
        medecin.setNom(data.getNom());
        medecin.setPrenom(data.getPrenom());
        medecin.setTelephone(data.getTelephone());

        if (photo != null && !photo.isEmpty()) {
            fileStorageService.supprimerPhoto(medecin.getPhotoProfil());
            medecin.setPhotoProfil(fileStorageService.sauvegarderPhoto(photo));
        }

        return medecinRepository.save(medecin);
    }

    // Changer mot de passe
    public void changerMotDePasse(UUID id, ChangePasswordDTO dto) {
        Medecin medecin = findById(id);

        // Vérifier l'ancien mot de passe
        if (!passwordEncoder.matches(dto.getAncienMotDePasse(), medecin.getMotDePasse())) {
            throw new IllegalArgumentException("Ancien mot de passe incorrect");
        }

        // Vérifier que le nouveau est différent
        if (dto.getNouveauMotDePasse().length() < 8) {
            throw new IllegalArgumentException("Le mot de passe doit contenir au moins 8 caractères");
        }

        medecin.setMotDePasse(passwordEncoder.encode(dto.getNouveauMotDePasse()));
        medecinRepository.save(medecin);
    }

}
