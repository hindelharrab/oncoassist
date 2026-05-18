package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.*;
import com.oncoassist.oncoassist.model.entity.Medecin;
import com.oncoassist.oncoassist.model.entity.RendezVous;
import com.oncoassist.oncoassist.model.entity.Specialite;
import com.oncoassist.oncoassist.repository.MedecinRepository;
import com.oncoassist.oncoassist.repository.PriseEnChargeRepository;
import com.oncoassist.oncoassist.repository.RendezVousRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.io.IOException;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedecinService {

    private final MedecinRepository medecinRepository;
    private final SpecialiteService specialiteService;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;
    private final RendezVousRepository rendezVousRepository;
    private final PriseEnChargeRepository priseEnChargeRepository;

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
    @Transactional(readOnly = true)
    public List<MedecinResponseDTO> findAllMedecins() {
        LocalDateTime debutJour = LocalDate.now().atStartOfDay();
        LocalDateTime finJour   = LocalDate.now().atTime(23, 59, 59);

        return medecinRepository.findAll()
                .stream()
                .map(m -> {
                    MedecinResponseDTO dto = new MedecinResponseDTO();
                    dto.setId(m.getId());
                    dto.setNom(m.getNom());
                    dto.setPrenom(m.getPrenom());
                    dto.setEmail(m.getEmail());
                    dto.setTelephone(m.getTelephone());
                    dto.setPhotoProfil(m.getPhotoProfil());
                    dto.setNumeroOrdre(m.getNumeroOrdre());
                    dto.setSpecialiteNom(
                            m.getSpecialite() != null
                                    ? m.getSpecialite().getNom()
                                    : null
                    );

                    // Nombre de patients actifs
                    long nbPatients = priseEnChargeRepository
                            .countByMedecinIdAndDateFinIsNull(m.getId());
                    dto.setNbPatients((int) nbPatients);

                    // RDV aujourd'hui
                    long rdvAujourdhui = rendezVousRepository
                            .countByMedecinIdAndDateBetween(
                                    m.getId(), debutJour, finJour
                            );
                    dto.setRdvAujourdhui((int) rdvAujourdhui);

                    return dto;
                })
                .collect(Collectors.toList());
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
    public MedecinResponseDTO findByIdDTO(UUID id) {
        Medecin m = findById(id);
        MedecinResponseDTO dto = new MedecinResponseDTO();
        dto.setId(m.getId());
        dto.setNom(m.getNom());
        dto.setPrenom(m.getPrenom());
        dto.setEmail(m.getEmail());
        dto.setTelephone(m.getTelephone());
        dto.setPhotoProfil(m.getPhotoProfil());
        dto.setNumeroOrdre(m.getNumeroOrdre());
        dto.setSpecialiteNom(m.getSpecialite() != null ? m.getSpecialite().getNom() : null);
        return dto;
    }

    // Ajoute cette méthode si elle n'existe pas
    public Medecin findByEmail(String email) {
        return medecinRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Médecin non trouvé: " + email));
    }
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPlanning(
            UUID medecinId, int semaine) {

        // Calculer début et fin de semaine
        LocalDate lundi = LocalDate.now()
                .with(DayOfWeek.MONDAY)
                .plusWeeks(semaine);
        LocalDate dimanche = lundi.plusDays(6);

        LocalDateTime debut = lundi.atStartOfDay();
        LocalDateTime fin   = dimanche.atTime(23, 59, 59);

        List<RendezVous> rdvs = rendezVousRepository
                .findByMedecinIdAndDateBetween(
                        medecinId, debut, fin
                );

        return rdvs.stream().map(rdv -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id",       rdv.getId());
            map.put("heure",    rdv.getDate() != null
                    ? rdv.getDate().format(
                    DateTimeFormatter.ofPattern("HH:mm"))
                    : "");
            map.put("patientNom", rdv.getPatient() != null
                    ? rdv.getPatient().getNom()
                    : "");
            map.put("patientPrenom", rdv.getPatient() != null
                    ? rdv.getPatient().getPrenom()
                    : "");
            map.put("motif",  rdv.getMotif());
            map.put("statut", rdv.getStatut() != null
                    ? rdv.getStatut().name()
                    : "EN_ATTENTE");
            map.put("jourOffset",
                    rdv.getDate() != null
                            ? rdv.getDate().getDayOfWeek().getValue() - 1
                            : 0);
            return map;
        }).collect(Collectors.toList());
    }
}
