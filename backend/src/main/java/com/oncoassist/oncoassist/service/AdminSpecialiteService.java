package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.admin.AdminSpecialiteDTO;
import com.oncoassist.oncoassist.model.dto.admin.AdminSpecialiteDTO.MedecinDTO;
import com.oncoassist.oncoassist.model.entity.Medecin;
import com.oncoassist.oncoassist.model.entity.Specialite;
import com.oncoassist.oncoassist.repository.SpecialiteRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminSpecialiteService {

    private final SpecialiteRepository specialiteRepository;

    // ── Liste ─────────────────────────────────────────────────────────────────
    public List<AdminSpecialiteDTO> findAll() {
        List<Specialite> avecMedecins = specialiteRepository.findAllWithMedecins();

        Map<UUID, Integer> secParSpec = specialiteRepository.findAllWithSecretaires()
                .stream()
                .collect(Collectors.toMap(
                        Specialite::getId,
                        s -> s.getSecretaires() != null ? s.getSecretaires().size() : 0
                ));

        return avecMedecins.stream()
                .map(s -> toDTOLight(s, secParSpec.getOrDefault(s.getId(), 0)))
                .collect(Collectors.toList());
    }

    // ── Détail ────────────────────────────────────────────────────────────────
    public AdminSpecialiteDTO findById(UUID id) {
        // Charge juste la spécialité avec ses médecins (sans collections imbriquées)
        Specialite s = specialiteRepository.findAllWithMedecins()
                .stream()
                .filter(sp -> sp.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException(
                        "Spécialité introuvable : " + id));

        int nbSec = specialiteRepository.findByIdWithSecretaires(id)
                .map(sp -> sp.getSecretaires() != null ? sp.getSecretaires().size() : 0)
                .orElse(0);

        return toDTODetail(s, nbSec);
    }

    // ── DTO léger (liste) ─────────────────────────────────────────────────────
    private AdminSpecialiteDTO toDTOLight(Specialite s, int nbSec) {
        List<Medecin> medecins = s.getMedecins() != null ? s.getMedecins() : List.of();

        // ✅ Comptage direct via SQL
        long totalPatients = specialiteRepository.countPatientsBySpecialite(s.getId());
        long totalRdv      = specialiteRepository.countRdvBySpecialite(s.getId());

        List<MedecinDTO> medecinDTOs = medecins.stream()
                .map(m -> MedecinDTO.builder()
                        .id(m.getId())
                        .nom(m.getNom())
                        .prenom(m.getPrenom())
                        .photoProfil(m.getPhotoProfil())
                        .nombreRdv(0L)
                        .nombrePatients(0L)
                        .build())
                .collect(Collectors.toList());

        return AdminSpecialiteDTO.builder()
                .id(s.getId())
                .nom(s.getNom())
                .description(s.getDescription())
                .nombreMedecins(medecins.size())
                .nombreSecretaires(nbSec)
                .nombrePatients(totalPatients)
                .nombreRdvMois(totalRdv)
                .dureeConsultation(s.getDureeConsultation() != null ? s.getDureeConsultation() : 30)
                .medecins(medecinDTOs)
                .build();
    }

    // ── DTO complet (détail) ──────────────────────────────────────────────────
    private AdminSpecialiteDTO toDTODetail(Specialite s, int nbSec) {
        List<Medecin> medecins = s.getMedecins() != null ? s.getMedecins() : List.of();

        // ✅ Comptage direct — patients et RDV de toute la spécialité
        long totalPatients = specialiteRepository.countPatientsBySpecialite(s.getId());
        long totalRdv      = specialiteRepository.countRdvBySpecialite(s.getId());

        // ✅ RDV du mois courant
        LocalDateTime debutMois = LocalDateTime.now()
                .withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        long rdvMois = specialiteRepository.countRdvMoisBySpecialite(s.getId(), debutMois);

        // ✅ Stats par médecin via SQL direct
        List<MedecinDTO> medecinDTOs = medecins.stream()
                .map(m -> MedecinDTO.builder()
                        .id(m.getId())
                        .nom(m.getNom())
                        .prenom(m.getPrenom())
                        .photoProfil(m.getPhotoProfil())
                        .nombreRdv(specialiteRepository.countRdvByMedecin(m.getId()))
                        .nombrePatients(specialiteRepository.countPatientsByMedecin(m.getId()))
                        .build())
                .collect(Collectors.toList());

        return AdminSpecialiteDTO.builder()
                .id(s.getId())
                .nom(s.getNom())
                .description(s.getDescription())
                .nombreMedecins(medecins.size())
                .nombreSecretaires(nbSec)
                .nombrePatients(totalPatients)
                .nombreRdvMois(rdvMois)
                .dureeConsultation(s.getDureeConsultation() != null ? s.getDureeConsultation() : 30)
                .medecins(medecinDTOs)
                .build();
    }
}