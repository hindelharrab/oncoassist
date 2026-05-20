package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.entity.Secretaire;
import com.oncoassist.oncoassist.model.entity.Specialite;
import com.oncoassist.oncoassist.repository.SecretaireRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SecretaireService {

    private final SecretaireRepository secretaireRepository;
    private final SpecialiteService    specialiteService;
    private final FileStorageService   fileStorageService;
    private final PasswordEncoder      passwordEncoder;

    // ── Créer ─────────────────────────────────────
    @Transactional
    public Secretaire creer(
            Secretaire secretaire, UUID specialiteId) {
        if (secretaireRepository
                .existsByEmail(secretaire.getEmail())) {
            throw new IllegalArgumentException(
                    "Email déjà utilisé : " + secretaire.getEmail()
            );
        }
        if (specialiteId != null) {
            Specialite sp = specialiteService
                    .findById(specialiteId);
            secretaire.setSpecialite(sp);
        }
        secretaire.setMotDePasse(
                passwordEncoder.encode(
                        secretaire.getMotDePasse()
                )
        );
        return secretaireRepository.save(secretaire);
    }

    // ── Lire tous ─────────────────────────────────
    public List<Secretaire> findAll() {
        return secretaireRepository.findAll();
    }

    // ── Lire un ───────────────────────────────────
    public Secretaire findById(UUID id) {
        return secretaireRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Secrétaire non trouvée : " + id
                        )
                );
    }

    // ── Par spécialité ────────────────────────────
    public List<Secretaire> findBySpecialite(
            UUID specialiteId) {
        return secretaireRepository
                .findBySpecialiteId(specialiteId);
    }

    // ── Modifier (admin) ──────────────────────────
    @Transactional
    public Secretaire modifier(
            UUID id, Secretaire data, UUID specialiteId) {
        Secretaire s = findById(id);
        s.setNom(data.getNom());
        s.setPrenom(data.getPrenom());
        s.setTelephone(data.getTelephone());

        if (specialiteId != null) {
            s.setSpecialite(
                    specialiteService.findById(specialiteId)
            );
        }
        if (data.getMotDePasse() != null
                && !data.getMotDePasse().isBlank()) {
            s.setMotDePasse(
                    passwordEncoder.encode(data.getMotDePasse())
            );
        }
        return secretaireRepository.save(s);
    }

    // ── Modifier son propre profil ────────────────
    @Transactional
    public Secretaire modifierProfil(
            UUID id, Secretaire data) {
        Secretaire s = findById(id);
        if (data.getNom() != null)
            s.setNom(data.getNom());
        if (data.getPrenom() != null)
            s.setPrenom(data.getPrenom());
        if (data.getTelephone() != null)
            s.setTelephone(data.getTelephone());
        return secretaireRepository.save(s);
    }

    // ── Modifier profil via Map (depuis settings) ─
    @Transactional
    public Secretaire modifierProfilMap(
            UUID id, Map<String, String> data) {
        Secretaire s = findById(id);
        if (data.get("nom") != null)
            s.setNom(data.get("nom"));
        if (data.get("prenom") != null)
            s.setPrenom(data.get("prenom"));
        if (data.get("telephone") != null)
            s.setTelephone(data.get("telephone"));
        return secretaireRepository.save(s);
    }

    // ── Changer mot de passe ──────────────────────
    @Transactional
    public void changerMotDePasse(
            UUID id, Map<String, String> data) {
        Secretaire s = findById(id);
        String ancien  = data.get("ancienMotDePasse");
        String nouveau = data.get("nouveauMotDePasse");

        if (!passwordEncoder.matches(
                ancien, s.getMotDePasse())) {
            throw new IllegalArgumentException(
                    "Mot de passe actuel incorrect"
            );
        }
        if (nouveau == null || nouveau.length() < 8) {
            throw new IllegalArgumentException(
                    "Le mot de passe doit contenir "
                            + "au moins 8 caractères"
            );
        }
        s.setMotDePasse(passwordEncoder.encode(nouveau));
        secretaireRepository.save(s);
    }

    // ── Changer photo de profil ───────────────────
    @Transactional
    public Secretaire changerPhoto(
            UUID id, MultipartFile photo) throws IOException {
        Secretaire s = findById(id);
        if (s.getPhotoProfil() != null) {
            fileStorageService.supprimerPhoto(
                    s.getPhotoProfil()
            );
        }
        s.setPhotoProfil(
                fileStorageService.sauvegarderPhoto(photo)
        );
        return secretaireRepository.save(s);
    }

    // ── Upload photo (ancienne méthode) ───────────
    @Transactional
    public String uploadPhoto(
            UUID id, MultipartFile file) throws IOException {
        Secretaire s = findById(id);
        if (s.getPhotoProfil() != null) {
            fileStorageService.supprimerPhoto(
                    s.getPhotoProfil()
            );
        }
        String chemin = fileStorageService
                .sauvegarderPhoto(file);
        s.setPhotoProfil(chemin);
        secretaireRepository.save(s);
        return chemin;
    }

    // ── Supprimer ─────────────────────────────────
    @Transactional
    public void supprimer(UUID id) {
        secretaireRepository.delete(findById(id));
    }
}