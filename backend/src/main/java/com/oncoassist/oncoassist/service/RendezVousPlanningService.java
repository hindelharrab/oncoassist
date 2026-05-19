package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.RendezVousDTO;
import com.oncoassist.oncoassist.model.entity.Medecin;
import com.oncoassist.oncoassist.model.entity.Patient;
import com.oncoassist.oncoassist.model.entity.RendezVous;
import com.oncoassist.oncoassist.model.entity.enums.StatutRDVEnum;  // ← corrigé
import com.oncoassist.oncoassist.repository.MedecinRepository;
import com.oncoassist.oncoassist.repository.PatientRepository;
import com.oncoassist.oncoassist.repository.RendezVousRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RendezVousPlanningService {

    private final RendezVousRepository rendezVousRepository;
    private final MedecinRepository    medecinRepository;
    private final PatientRepository    patientRepository;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
    private static final int DEFAULT_DUREE = 30;

    @Transactional(readOnly = true)
    public List<RendezVousDTO> getRdvBySemaine(LocalDate dateReference, UUID medecinId) {
        LocalDate lundi = dateReference.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDateTime debut = lundi.atStartOfDay();
        LocalDateTime fin = lundi.plusDays(6).atTime(LocalTime.MAX);

        List<RendezVous> rdvs;
        if (medecinId != null) {
            rdvs = rendezVousRepository.findByMedecinIdAndDateBetween(medecinId, debut, fin);
        } else {
            rdvs = rendezVousRepository.findByDateBetween(debut, fin);
        }

        return rdvs.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public RendezVousDTO creer(RendezVousDTO dto) {
        RendezVous rdv = new RendezVous();
        rdv.setDate(dto.getDate());
        rdv.setMotif(dto.getMotif());
        rdv.setLieu(dto.getLieu());
        rdv.setDateCreation(LocalDateTime.now());
        rdv.setStatut(dto.getStatut() != null ? dto.getStatut() : StatutRDVEnum.EN_ATTENTE);

        if (dto.getPatientId() != null) {
            Patient patient = patientRepository.findById(dto.getPatientId())
                    .orElseThrow(() -> new RuntimeException("Patient introuvable : " + dto.getPatientId()));
            rdv.setPatient(patient);
        }

        if (dto.getMedecinId() != null) {
            Medecin medecin = medecinRepository.findById(dto.getMedecinId())
                    .orElseThrow(() -> new RuntimeException("Médecin introuvable : " + dto.getMedecinId()));
            rdv.setMedecin(medecin);
        }

        return toDTO(rendezVousRepository.save(rdv));
    }

    @Transactional
    public RendezVousDTO modifier(UUID id, RendezVousDTO dto) {
        RendezVous rdv = rendezVousRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("RDV introuvable : " + id));

        if (dto.getDate() != null) rdv.setDate(dto.getDate());
        if (dto.getMotif() != null) rdv.setMotif(dto.getMotif());
        if (dto.getLieu() != null) rdv.setLieu(dto.getLieu());
        if (dto.getStatut() != null) rdv.setStatut(dto.getStatut());

        if (dto.getPatientId() != null) {
            Patient patient = patientRepository.findById(dto.getPatientId())
                    .orElseThrow(() -> new RuntimeException("Patient introuvable"));
            rdv.setPatient(patient);
        }

        if (dto.getMedecinId() != null) {
            Medecin medecin = medecinRepository.findById(dto.getMedecinId())
                    .orElseThrow(() -> new RuntimeException("Médecin introuvable"));
            rdv.setMedecin(medecin);
        }

        return toDTO(rendezVousRepository.save(rdv));
    }

    @Transactional
    public RendezVousDTO annuler(UUID id) {
        RendezVous rdv = rendezVousRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("RDV introuvable : " + id));
        rdv.setStatut(StatutRDVEnum.ANNULE);
        return toDTO(rendezVousRepository.save(rdv));
    }

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
            dto.setHeure(rdv.getDate().format(DateTimeFormatter.ofPattern("HH:mm")));
            // 1 = lundi, 7 = dimanche → -1 pour avoir 0-6
            int jourOffset = rdv.getDate().getDayOfWeek().getValue() - 1;
            dto.setJourOffset(jourOffset);

            String[] jours = {"Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"};
            dto.setJour(jours[jourOffset]);
        }

        return dto;
    }
}