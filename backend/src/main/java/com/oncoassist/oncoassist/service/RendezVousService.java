package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.RendezVousDTO;
import com.oncoassist.oncoassist.model.entity.Patient;
import com.oncoassist.oncoassist.model.entity.RendezVous;
import com.oncoassist.oncoassist.model.entity.enums.StatutRDVEnum;
import com.oncoassist.oncoassist.repository.RendezVousRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
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

    public RendezVous planifier(UUID id, LocalDateTime date, String lieu) {
        RendezVous rdv = findById(id);
        rdv.setDate(date);
        rdv.setLieu(lieu);
        rdv.setStatut(StatutRDVEnum.PLANIFIE);
        return rendezVousRepository.save(rdv);
    }

    public RendezVous marquerEffectue(UUID id) {
        RendezVous rdv = findById(id);
        rdv.setStatut(StatutRDVEnum.EFFECTUE);
        return rendezVousRepository.save(rdv);
    }

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
        Patient patient = rdv.getPatient();
        return RendezVousDTO.builder()
                .id(rdv.getId())
                .motif(rdv.getMotif())
                .statut(rdv.getStatut())
                .date(rdv.getDate())
                .lieu(rdv.getLieu())
                .dateCreation(rdv.getDateCreation())
                .patientNom(patient    != null ? patient.getNom()    : null)
                .patientPrenom(patient != null ? patient.getPrenom() : null)
                .patientId(patient     != null ? patient.getId()     : null)
                .build();
    }

    // ── Lectures (retournent RendezVousDTO) ──────────────────────────────
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