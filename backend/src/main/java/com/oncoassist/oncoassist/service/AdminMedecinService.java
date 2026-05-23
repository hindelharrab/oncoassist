package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.admin.AdminMedecinDetailDTO;
import com.oncoassist.oncoassist.model.entity.DisponibiliteMedecin;
import com.oncoassist.oncoassist.model.entity.DocumentMedecin;
import com.oncoassist.oncoassist.model.entity.Medecin;
import com.oncoassist.oncoassist.model.entity.RendezVous;
import com.oncoassist.oncoassist.model.entity.enums.StatutRDVEnum;
import com.oncoassist.oncoassist.repository.DisponibiliteMedecinRepository;
import com.oncoassist.oncoassist.repository.DocumentMedecinRepository;
import com.oncoassist.oncoassist.repository.MedecinRepository;
import com.oncoassist.oncoassist.repository.PriseEnChargeRepository;
import com.oncoassist.oncoassist.repository.RendezVousRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminMedecinService {

    private final MedecinRepository              medecinRepository;
    private final PriseEnChargeRepository        priseEnChargeRepository;
    private final RendezVousRepository           rendezVousRepository;
    private final DocumentMedecinRepository      documentMedecinRepository;
    private final DisponibiliteMedecinRepository disponibiliteRepository;

    private static final DateTimeFormatter FMT =
            DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm", Locale.FRENCH);

    public List<AdminMedecinDetailDTO> findAll() {
        return medecinRepository.findAll().stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public AdminMedecinDetailDTO findById(UUID id) {
        return toDTO(medecinRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Médecin introuvable : " + id)));
    }

    private AdminMedecinDetailDTO toDTO(Medecin m) {
        AdminMedecinDetailDTO dto = new AdminMedecinDetailDTO();

        dto.setId(m.getId());
        dto.setNom(m.getNom());
        dto.setPrenom(m.getPrenom());
        dto.setEmail(m.getEmail());
        dto.setTelephone(m.getTelephone());
        dto.setPhotoProfil(m.getPhotoProfil());
        dto.setNumeroOrdre(m.getNumeroOrdre());
        dto.setStatut("ACTIF");

        if (m.getSpecialite() != null) {
            dto.setSpecialiteId(m.getSpecialite().getId());
            dto.setSpecialiteNom(m.getSpecialite().getNom());
        }

        // Stats patients
        long nbPatients = priseEnChargeRepository.countByMedecinIdAndDateFinIsNull(m.getId());
        dto.setNbPatients((int) nbPatients);

        // RDV aujourd'hui
        LocalDateTime debut = LocalDate.now().atStartOfDay();
        LocalDateTime fin   = LocalDate.now().atTime(23, 59, 59);
        dto.setRdvAujourdhui((int) rendezVousRepository
                .countByMedecinIdAndDateBetween(m.getId(), debut, fin));

        // Stats RDV
        if (m.getRendezVous() != null) {
            List<RendezVous> rdvs = m.getRendezVous();
            dto.setTotalRdv(rdvs.size());
            dto.setRdvEffectues((int) rdvs.stream()
                    .filter(r -> r.getStatut() == StatutRDVEnum.EFFECTUE).count());
            dto.setRdvAnnules((int) rdvs.stream()
                    .filter(r -> r.getStatut() == StatutRDVEnum.ANNULE).count());

            // 5 derniers RDV
            dto.setDerniersRdv(rdvs.stream()
                    .filter(r -> r.getDate() != null)
                    .sorted(Comparator.comparing(RendezVous::getDate).reversed())
                    .limit(5)
                    .map(r -> {
                        AdminMedecinDetailDTO.AdminRdvSummary s = new AdminMedecinDetailDTO.AdminRdvSummary();
                        s.setId(r.getId());
                        s.setDate(r.getDate().format(FMT));
                        s.setMotif(r.getMotif());
                        s.setStatut(r.getStatut() != null ? r.getStatut().name() : "—");
                        s.setLieu(r.getLieu());
                        if (r.getPatient() != null) {
                            s.setPatientNom(r.getPatient().getNom());
                            s.setPatientPrenom(r.getPatient().getPrenom());
                        }
                        return s;
                    }).collect(Collectors.toList()));
        } else {
            dto.setTotalRdv(0); dto.setRdvEffectues(0); dto.setRdvAnnules(0);
            dto.setDerniersRdv(Collections.emptyList());
        }

        // ── Disponibilités par jour ───────────────────────────
        List<DisponibiliteMedecin> dispos = disponibiliteRepository.findByMedecinId(m.getId());

        // Si aucune dispo en base → créer les valeurs par défaut (lun-ven)
        if (dispos.isEmpty()) {
            List<String> defaut = List.of("MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY");
            dispos = defaut.stream().map(jour -> {
                DisponibiliteMedecin d = new DisponibiliteMedecin();
                d.setJour(jour);
                d.setHeureDebut("09:00");
                d.setHeureFin("17:00");
                return d;
            }).collect(Collectors.toList());
        }

        dto.setDisponibilites(dispos.stream().map(d -> {
            AdminMedecinDetailDTO.DisponibiliteDTO dd = new AdminMedecinDetailDTO.DisponibiliteDTO();
            dd.setId(d.getId());
            dd.setJour(d.getJour());
            dd.setHeureDebut(d.getHeureDebut());
            dd.setHeureFin(d.getHeureFin());
            return dd;
        }).collect(Collectors.toList()));

        // ── Documents ─────────────────────────────────────────
        dto.setDocuments(documentMedecinRepository.findByMedecinId(m.getId()).stream()
                .map(d -> {
                    AdminMedecinDetailDTO.DocumentSummary ds = new AdminMedecinDetailDTO.DocumentSummary();
                    ds.setId(d.getId());
                    ds.setNom(d.getNom());
                    ds.setTypeDocument(d.getTypeDocument());
                    ds.setTailleFichier(d.getTailleFichier());
                    ds.setDateAjout(d.getDateAjout());
                    ds.setCheminFichier(d.getCheminFichier());
                    return ds;
                }).collect(Collectors.toList()));

        return dto;
    }
}