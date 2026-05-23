package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.admin.AdminSecretaireDTO;
import com.oncoassist.oncoassist.model.dto.admin.AdminSecretaireDTO.ActiviteDTO;
import com.oncoassist.oncoassist.model.entity.RendezVous;
import com.oncoassist.oncoassist.model.entity.Secretaire;
import com.oncoassist.oncoassist.model.entity.enums.StatutRDVEnum;
import com.oncoassist.oncoassist.repository.SecretaireRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminSecretaireService {

    private final SecretaireRepository secretaireRepository;

    public List<AdminSecretaireDTO> findAll() {
        // ✅ utilise findAllWithRdv pour éviter le lazy
        return secretaireRepository.findAllWithRdv()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public AdminSecretaireDTO findById(UUID id) {
        // ✅ utilise findByIdWithRdv pour charger les RDV + patients
        Secretaire s = secretaireRepository.findByIdWithRdv(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Secrétaire introuvable : " + id));
        return toDTO(s);
    }

    private AdminSecretaireDTO toDTO(Secretaire s) {

        List<RendezVous> rdvs = s.getRendezVousGeres() != null
                ? s.getRendezVousGeres()
                : List.of();

        long planifies = rdvs.stream()
                .filter(r -> StatutRDVEnum.PLANIFIE.equals(r.getStatut()))
                .count();

        long effectues = rdvs.stream()
                .filter(r -> StatutRDVEnum.EFFECTUE.equals(r.getStatut()))
                .count();

        long annules = rdvs.stream()
                .filter(r -> StatutRDVEnum.ANNULE.equals(r.getStatut()))
                .count();

        long enAttente = rdvs.stream()
                .filter(r -> StatutRDVEnum.EN_ATTENTE.equals(r.getStatut()))
                .count();

        List<ActiviteDTO> activites = rdvs.stream()
                .filter(r -> r.getDate() != null)
                .sorted(Comparator.comparing(RendezVous::getDate).reversed())
                .limit(10)
                .map(this::toActiviteDTO)
                .collect(Collectors.toList());

        return AdminSecretaireDTO.builder()
                .id(s.getId())
                .nom(s.getNom())
                .prenom(s.getPrenom())
                .email(s.getEmail())
                .telephone(s.getTelephone())
                .photoProfil(s.getPhotoProfil())
                .role(s.getRole() != null ? s.getRole().name() : null)
                .specialiteId(s.getSpecialite() != null ? s.getSpecialite().getId()  : null)
                .specialiteNom(s.getSpecialite() != null ? s.getSpecialite().getNom() : null)
                .totalRendezVousGeres((long) rdvs.size())
                .rdvPlanifies(planifies)
                .rdvEffectues(effectues)
                .rdvAnnules(annules)
                .rdvEnAttente(enAttente)
                .activitesRecentes(activites)
                .build();
    }

    private ActiviteDTO toActiviteDTO(RendezVous r) {
        DateTimeFormatter dateFmt  = DateTimeFormatter.ofPattern("dd MMM yyyy");
        DateTimeFormatter heureFmt = DateTimeFormatter.ofPattern("HH:mm");

        String patientNom    = "";
        String patientPrenom = "";
        if (r.getPatient() != null) {
            patientNom    = r.getPatient().getNom();
            patientPrenom = r.getPatient().getPrenom();
        }

        return ActiviteDTO.builder()
                .date(r.getDate().format(dateFmt))
                .heure(r.getDate().format(heureFmt))
                .action(resolveLabel(r.getStatut()))
                .typeAction(resolveTypeAction(r.getStatut()))
                .patientNom(patientNom)
                .patientPrenom(patientPrenom)
                .rendezVousId(r.getId())
                .build();
    }

    private String resolveLabel(StatutRDVEnum statut) {
        if (statut == null) return "Action";
        return switch (statut) {
            case EN_ATTENTE -> "En attente";
            case PLANIFIE   -> "RDV planifié";
            case EFFECTUE   -> "RDV effectué";
            case ANNULE     -> "RDV annulé";
        };
    }

    private String resolveTypeAction(StatutRDVEnum statut) {
        if (statut == null) return "create";
        return switch (statut) {
            case EN_ATTENTE -> "create";
            case PLANIFIE   -> "confirm";
            case EFFECTUE   -> "effectue";
            case ANNULE     -> "cancel";
        };
    }


}