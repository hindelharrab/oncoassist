package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.entity.Secretaire;
import com.oncoassist.oncoassist.model.entity.Specialite;
import com.oncoassist.oncoassist.model.entity.enums.RoleEnum;
import com.oncoassist.oncoassist.repository.SecretaireRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SecretaireService {

    private final SecretaireRepository secretaireRepository;
    private final SpecialiteService specialiteService;
    private final PasswordEncoder passwordEncoder;

    public Secretaire creer(Secretaire secretaire, UUID specialiteId) {
        if (secretaireRepository.existsByEmail(secretaire.getEmail())) {
            throw new IllegalArgumentException("Email déjà utilisé : " + secretaire.getEmail());
        }

        // ✅ Encodage mot de passe
        secretaire.setMotDePasse(passwordEncoder.encode(secretaire.getMotDePasse()));
        secretaire.setRole(RoleEnum.SECRETAIRE);

        if (specialiteId != null) {
            Specialite specialite = specialiteService.findById(specialiteId);
            secretaire.setSpecialite(specialite);
        }

        return secretaireRepository.save(secretaire);
    }

    public List<Secretaire> findAll() {
        return secretaireRepository.findAll();
    }

    public Secretaire findById(UUID id) {
        return secretaireRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Secrétaire non trouvée : " + id));
    }

    public List<Secretaire> findBySpecialite(UUID specialiteId) {
        return secretaireRepository.findBySpecialiteId(specialiteId);
    }

    public Secretaire modifier(UUID id, Secretaire data, UUID specialiteId) {
        Secretaire secretaire = findById(id);
        secretaire.setNom(data.getNom());
        secretaire.setPrenom(data.getPrenom());
        secretaire.setTelephone(data.getTelephone());

        // Modifier mot de passe seulement si fourni
        if (data.getMotDePasse() != null && !data.getMotDePasse().isBlank()) {
            secretaire.setMotDePasse(passwordEncoder.encode(data.getMotDePasse()));
        }

        if (specialiteId != null) {
            secretaire.setSpecialite(specialiteService.findById(specialiteId));
        }

        return secretaireRepository.save(secretaire);
    }

    public void supprimer(UUID id) {
        secretaireRepository.delete(findById(id));
    }
}