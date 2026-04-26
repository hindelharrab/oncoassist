package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.auth.*;
import com.oncoassist.oncoassist.model.entity.*;
import com.oncoassist.oncoassist.model.entity.enums.RoleEnum;
import com.oncoassist.oncoassist.model.entity.enums.StatutDossierEnum;
import com.oncoassist.oncoassist.repository.*;
import com.oncoassist.oncoassist.security.JwtService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final SpecialiteRepository specialiteRepository;
    private final DossierMedicalRepository dossierMedicalRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    // ===== LOGIN =====
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getMotDePasse())
        );

        Utilisateur user = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé"));

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getMotDePasse())
                .authorities("ROLE_" + user.getRole().name())
                .build();

        String token = jwtService.generateToken(userDetails, user.getRole().name(), user.getId().toString());

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    // ===== REGISTER =====
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email déjà utilisé : " + request.getEmail());
        }

        Utilisateur user = switch (request.getRole()) {
            case ADMIN -> creerAdmin(request);
            case MEDECIN -> creerMedecin(request);
            case SECRETAIRE -> creerSecretaire(request);
            case PATIENT -> creerPatient(request);
        };

        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail());
        user.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        user.setTelephone(request.getTelephone());
        user.setRole(request.getRole());

        Utilisateur saved = utilisateurRepository.save(user);

        // Création automatique du dossier médical pour Patient
        if (saved instanceof Patient patient) {
            DossierMedical dossier = new DossierMedical();
            dossier.setPatient(patient);
            dossier.setDateCreation(LocalDate.now());
            dossier.setStatut(StatutDossierEnum.ACTIF);
            dossierMedicalRepository.save(dossier);
        }

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(saved.getEmail())
                .password(saved.getMotDePasse())
                .authorities("ROLE_" + saved.getRole().name())
                .build();

        String token = jwtService.generateToken(userDetails, saved.getRole().name(), saved.getId().toString());

        return AuthResponse.builder()
                .token(token)
                .id(saved.getId())
                .nom(saved.getNom())
                .prenom(saved.getPrenom())
                .email(saved.getEmail())
                .role(saved.getRole())
                .build();
    }

    private Admin creerAdmin(RegisterRequest r) {
        return new Admin();
    }

    private Medecin creerMedecin(RegisterRequest r) {
        Medecin m = new Medecin();
        m.setNumeroOrdre(r.getNumeroOrdre());
        if (r.getSpecialiteId() != null) {
            Specialite sp = specialiteRepository.findById(r.getSpecialiteId())
                    .orElseThrow(() -> new EntityNotFoundException("Spécialité non trouvée"));
            m.setSpecialite(sp);
        }
        return m;
    }

    private Secretaire creerSecretaire(RegisterRequest r) {
        Secretaire s = new Secretaire();
        if (r.getSpecialiteId() != null) {
            Specialite sp = specialiteRepository.findById(r.getSpecialiteId())
                    .orElseThrow(() -> new EntityNotFoundException("Spécialité non trouvée"));
            s.setSpecialite(sp);
        }
        return s;
    }

    private Patient creerPatient(RegisterRequest r) {
        Patient p = new Patient();
        p.setDateNaissance(r.getDateNaissance());
        p.setAdresse(r.getAdresse());
        p.setPersonneConfiance(r.getPersonneConfiance());
        return p;
    }

    // ===== FORGOT PASSWORD =====
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        Utilisateur user = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("Aucun compte avec cet email"));

        // Supprimer anciens tokens
        resetTokenRepository.deleteByUtilisateurId(user.getId());

        // Générer nouveau token
        PasswordResetToken token = new PasswordResetToken();
        token.setToken(UUID.randomUUID().toString());
        token.setUtilisateurId(user.getId());
        token.setDateCreation(LocalDateTime.now());
        token.setDateExpiration(LocalDateTime.now().plusHours(1));
        resetTokenRepository.save(token);

        // Envoyer email
        try {
            emailService.envoyerEmailResetPassword(user.getEmail(), token.getToken());
        } catch (Exception e) {
            // Si le mail ne part pas, on log le token pour tests
            System.out.println("[TEST] Token reset : " + token.getToken());
        }
    }

    // ===== RESET PASSWORD =====
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken token = resetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Token invalide"));

        if (token.estExpire()) {
            resetTokenRepository.delete(token);
            throw new IllegalArgumentException("Token expiré");
        }

        Utilisateur user = utilisateurRepository.findById(token.getUtilisateurId())
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé"));

        user.setMotDePasse(passwordEncoder.encode(request.getNouveauMotDePasse()));
        utilisateurRepository.save(user);

        resetTokenRepository.delete(token);
    }
}