package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.RendezVousDTO;
import com.oncoassist.oncoassist.model.entity.Patient;
import com.oncoassist.oncoassist.model.entity.RendezVous;
import com.oncoassist.oncoassist.model.entity.enums.StatutRDVEnum;
import com.oncoassist.oncoassist.repository.RendezVousRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RendezVousService {

    private final RendezVousRepository rendezVousRepository;
    private final MedecinService medecinService;
    private final PatientService patientService;

    // ── Mutations (restent avec RendezVous) ──────────────────────────────
    public RendezVous demander(UUID medecinId, UUID patientId, String motif) {
        RendezVous rdv = new RendezVous();
        rdv.setMedecin(medecinService.findById(medecinId));
        rdv.setPatient(patientService.findById(patientId));
        rdv.setMotif(motif);
        rdv.setStatut(StatutRDVEnum.EN_ATTENTE);
        rdv.setDateCreation(LocalDateTime.now());
        return rendezVousRepository.save(rdv);
    }
    @Transactional
    public RendezVous planifier(UUID id, LocalDateTime date, String lieu) {
        RendezVous rdv = findById(id);
        rdv.setDate(date);
        rdv.setLieu(lieu);
        rdv.setStatut(StatutRDVEnum.PLANIFIE);
        return rendezVousRepository.save(rdv);
    }
    @Transactional
    public RendezVous marquerEffectue(UUID id) {
        RendezVous rdv = findById(id);
        rdv.setStatut(StatutRDVEnum.EFFECTUE);
        return rendezVousRepository.save(rdv);
    }
    @Transactional
    public RendezVous annuler(UUID id) {
        RendezVous rdv = findById(id);
        rdv.setStatut(StatutRDVEnum.ANNULE);
        return rendezVousRepository.save(rdv);
    }

    // ── findById (usage interne uniquement) ─────────────────────────────
    public RendezVous findById(UUID id) {
        return rendezVousRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Rendez-vous non trouvé : " + id));
    }

    // ── Conversion ───────────────────────────────────────────────────────
    public RendezVousDTO toDTO(RendezVous rdv) {
        RendezVousDTO dto = RendezVousDTO.builder()
                .id(rdv.getId())
                .motif(rdv.getMotif())
                .statut(rdv.getStatut())
                .date(rdv.getDate())
                .lieu(rdv.getLieu())
                .dateCreation(rdv.getDateCreation())
                .duree(30)
                .build();

        // Patient
        if (rdv.getPatient() != null) {
            dto.setPatientId(rdv.getPatient().getId());
            dto.setPatientNom(rdv.getPatient().getNom());
            dto.setPatientPrenom(rdv.getPatient().getPrenom());
        }

        // 🔥 MÉDECIN — AJOUTER CES LIGNES
        if (rdv.getMedecin() != null) {
            dto.setMedecinId(rdv.getMedecin().getId());
            dto.setMedecinNom(rdv.getMedecin().getNom());
            dto.setMedecinPrenom(rdv.getMedecin().getPrenom());
            if (rdv.getMedecin().getSpecialite() != null) {
                dto.setMedecinSpecialite(rdv.getMedecin().getSpecialite().getNom());
            }
        }

        // 🔥 HEURE ET JOUR OFFSET — AJOUTER CES LIGNES
        if (rdv.getDate() != null) {
            java.time.format.DateTimeFormatter timeFmt =
                    java.time.format.DateTimeFormatter.ofPattern("HH:mm");
            dto.setHeure(rdv.getDate().format(timeFmt));

            // 1 = lundi, 7 = dimanche → -1 pour avoir 0-6
            int jourOffset = rdv.getDate().getDayOfWeek().getValue() - 1;
            dto.setJourOffset(jourOffset);

            String[] jours = {"Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"};
            dto.setJour(jours[jourOffset]);
        }

        return dto;
    }

    // ── Lectures (retournent RendezVousDTO) ──────────────────────────────
    @Transactional
    public List<RendezVousDTO> findAll() {
        return rendezVousRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public List<RendezVousDTO> findByMedecin(UUID medecinId) {
        return rendezVousRepository.findByMedecinId(medecinId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public List<RendezVousDTO> findByPatient(UUID patientId) {
        return rendezVousRepository.findByPatientId(patientId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public List<RendezVousDTO> findEnAttente() {
        return rendezVousRepository.findByStatut(StatutRDVEnum.EN_ATTENTE)
                .stream()
                .map(this::toDTO)
                .toList();
    }
}