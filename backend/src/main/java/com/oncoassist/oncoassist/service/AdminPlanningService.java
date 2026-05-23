package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.admin.*;
import com.oncoassist.oncoassist.model.entity.RendezVous;
import com.oncoassist.oncoassist.model.entity.enums.StatutRDVEnum;
import com.oncoassist.oncoassist.repository.MedecinRepository;
import com.oncoassist.oncoassist.repository.RendezVousRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminPlanningService {

    private final RendezVousRepository rdvRepo;
    private final MedecinRepository    medecinRepo;

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    // ── Vue SEMAINE ───────────────────────────────────────────
    public PlanningOverviewDTO getSemaine(UUID medecinId, LocalDate dateDebut) {
        LocalDateTime from = dateDebut.atStartOfDay();
        LocalDateTime to   = dateDebut.plusDays(7).atStartOfDay();
        return buildOverview(medecinId, from, to);
    }

    // ── Vue JOUR ──────────────────────────────────────────────
    public PlanningOverviewDTO getJour(UUID medecinId, LocalDate date) {
        LocalDateTime from = date.atStartOfDay();
        LocalDateTime to   = date.plusDays(1).atStartOfDay();
        return buildOverview(medecinId, from, to);
    }

    // ── Vue MOIS ──────────────────────────────────────────────
    public PlanningOverviewDTO getMois(UUID medecinId, int year, int month) {
        LocalDateTime from = LocalDate.of(year, month, 1).atStartOfDay();
        LocalDateTime to   = from.plusMonths(1);
        return buildOverview(medecinId, from, to);
    }

    // ── Builder commun ────────────────────────────────────────
    private PlanningOverviewDTO buildOverview(UUID medecinId,
                                              LocalDateTime from,
                                              LocalDateTime to) {
        List<RendezVous> rdvs = medecinId != null
                ? rdvRepo.findByMedecinAndPeriodWithDetails(medecinId, from, to)
                : rdvRepo.findByPeriodWithDetails(from, to);

        List<PlanningRdvDTO> dtos = rdvs.stream()
                .map(this::toRdvDTO)
                .collect(Collectors.toList());

        List<PlanningMedecinDTO> medecins = medecinRepo.findAll().stream()
                .map(m -> PlanningMedecinDTO.builder()
                        .id(m.getId())
                        .nom(m.getNom())
                        .prenom(m.getPrenom())
                        .specialite(m.getSpecialite() != null ? m.getSpecialite().getNom() : "")
                        .photo(m.getPhotoProfil())
                        .build())
                .collect(Collectors.toList());

        long confirmes = rdvs.stream()
                .filter(r -> r.getStatut() == StatutRDVEnum.PLANIFIE).count();
        long enAttente = rdvs.stream()
                .filter(r -> r.getStatut() == StatutRDVEnum.EN_ATTENTE).count();
        long annules   = rdvs.stream()
                .filter(r -> r.getStatut() == StatutRDVEnum.ANNULE).count();

        return PlanningOverviewDTO.builder()
                .medecins(medecins)
                .rdvs(dtos)
                .totalConfirmes(confirmes)
                .totalEnAttente(enAttente)
                .totalUrgents(0L)   // pas de statut URGENT en base, extensible
                .totalAnnules(annules)
                .build();
    }

    private PlanningRdvDTO toRdvDTO(RendezVous r) {
        return PlanningRdvDTO.builder()
                .id(r.getId())
                .motif(r.getMotif())
                .statut(r.getStatut() != null ? r.getStatut().name() : "EN_ATTENTE")
                .date(r.getDate() != null ? r.getDate().format(ISO) : null)
                .lieu(r.getLieu())
                .patientNom(r.getPatient() != null ? r.getPatient().getNom() : "")
                .patientPrenom(r.getPatient() != null ? r.getPatient().getPrenom() : "")
                .patientPhoto(r.getPatient() != null ? r.getPatient().getPhotoProfil() : null)
                .medecinNom(r.getMedecin() != null ? r.getMedecin().getNom() : "")
                .medecinPrenom(r.getMedecin() != null ? r.getMedecin().getPrenom() : "")
                .secretaireNom(r.getSecretaire() != null ? r.getSecretaire().getNom() : null)
                .secretairePrenom(r.getSecretaire() != null ? r.getSecretaire().getPrenom() : null)
                .build();
    }
}