package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.consultation.*;
import com.oncoassist.oncoassist.model.entity.*;
import com.oncoassist.oncoassist.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ExamenManuelRepository examenManuelRepository;
    private final AntecedentMedicalRepository antecedentMedicalRepository;
    private final AntecedentFamilialRepository antecedentFamilialRepository;
    private final DossierMedicalRepository dossierMedicalRepository;
    private final MedecinRepository medecinRepository;

    // ─────────────────────────────────────────────────────────
    // CRÉER une consultation complète
    // ─────────────────────────────────────────────────────────
    @Transactional
    public ConsultationResponseDTO creerConsultation(UUID dossierId, ConsultationRequestDTO dto) {

        DossierMedical dossier = dossierMedicalRepository.findById(dossierId)
                .orElseThrow(() -> new RuntimeException("Dossier médical introuvable : " + dossierId));

        Medecin medecin = medecinRepository.findById(dto.getMedecinId())
                .orElseThrow(() -> new RuntimeException("Médecin introuvable : " + dto.getMedecinId()));

        // 1. Créer l'ExamenManuel
        ExamenManuel examen = new ExamenManuel();
        examen.setDate(LocalDateTime.now());
        examen.setDossierMedical(dossier);
        examen.setAuteur(medecin);
        examen.setVisiblePatient(false);

        ExamenManuelRequestDTO ex = dto.getExamenManuel();
        examen.setMassePalpee(ex.getMassePalpee());
        examen.setLocalisationDeMasse(ex.getLocalisationDeMasse());
        examen.setSiteAnatomique(ex.getSiteAnatomique());
        examen.setAspectPeau(ex.getAspectPeau());
        examen.setAdenopathies(ex.getAdenopathies());
        examen.setDescription(ex.getDescription());
        examen.setNotes(dto.getNotes());

        ExamenManuel savedExamen = examenManuelRepository.save(examen);

        // 2. Créer les antécédents médicaux liés au dossier
        List<AntecedentMedical> antecMedicaux = dto.getAntecedentsMedicaux().stream()
                .map(a -> {
                    AntecedentMedical antec = new AntecedentMedical();
                    antec.setMaladie(a.getMaladie());
                    antec.setDateDiagnostic(a.getDateDiagnostic());
                    antec.setStatut(a.getStatut());
                    antec.setTraitements(a.getTraitements());
                    antec.setDossierMedical(dossier);
                    return antec;
                })
                .collect(Collectors.toList());
        List<AntecedentMedical> savedMedicaux = antecedentMedicalRepository.saveAll(antecMedicaux);

        // 3. Créer les antécédents familiaux liés au dossier
        List<AntecedentFamilial> antecFamiliaux = dto.getAntecedentsFamiliaux().stream()
                .map(a -> {
                    AntecedentFamilial antec = new AntecedentFamilial();
                    antec.setLienFamilial(a.getLienFamilial());
                    antec.setMaladie(a.getMaladie());
                    antec.setAgeSurvenue(a.getAgeSurvenue() != null ? String.valueOf(a.getAgeSurvenue()) : null);
                    antec.setDossierMedical(dossier);
                    return antec;
                })
                .collect(Collectors.toList());
        List<AntecedentFamilial> savedFamiliaux = antecedentFamilialRepository.saveAll(antecFamiliaux);

        return buildResponse(savedExamen, savedMedicaux, savedFamiliaux);
    }

    // ─────────────────────────────────────────────────────────
    // GET toutes les consultations d'un dossier
    // Retourne chaque ExamenManuel + tous les antécédents du dossier
    // ─────────────────────────────────────────────────────────
    public List<ConsultationResponseDTO> getConsultationsByDossier(UUID dossierId) {

        if (!dossierMedicalRepository.existsById(dossierId)) {
            throw new RuntimeException("Dossier médical introuvable : " + dossierId);
        }

        List<ExamenManuel> examens = examenManuelRepository
                .findByDossierMedicalIdOrderByDateDesc(dossierId);

        List<AntecedentMedical> medicaux = antecedentMedicalRepository
                .findByDossierMedicalId(dossierId);

        List<AntecedentFamilial> familiaux = antecedentFamilialRepository
                .findByDossierMedicalId(dossierId);

        // Chaque "consultation" = un ExamenManuel + tous les antécédents du dossier
        return examens.stream()
                .map(e -> buildResponse(e, medicaux, familiaux))
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────
    // SUPPRIMER un ExamenManuel (les antécédents restent dans le dossier)
    // ─────────────────────────────────────────────────────────
    @Transactional
    public void supprimerExamenManuel(UUID examenId) {
        ExamenManuel examen = examenManuelRepository.findById(examenId)
                .orElseThrow(() -> new RuntimeException("Examen introuvable : " + examenId));
        examenManuelRepository.delete(examen);
    }

    // ─────────────────────────────────────────────────────────
    // MODIFIER un ExamenManuel existant
    // ─────────────────────────────────────────────────────────
    @Transactional
    public ExamenManuelResponseDTO modifierExamenManuel(UUID examenId, ExamenManuelRequestDTO dto) {
        ExamenManuel examen = examenManuelRepository.findById(examenId)
                .orElseThrow(() -> new RuntimeException("Examen introuvable : " + examenId));

        examen.setMassePalpee(dto.getMassePalpee());
        examen.setLocalisationDeMasse(dto.getLocalisationDeMasse());
        examen.setSiteAnatomique(dto.getSiteAnatomique());
        examen.setAspectPeau(dto.getAspectPeau());
        examen.setAdenopathies(dto.getAdenopathies());
        examen.setDescription(dto.getDescription());

        return toExamenDTO(examenManuelRepository.save(examen));
    }

    // ─────────────────────────────────────────────────────────
    // SUPPRIMER un antécédent médical
    // ─────────────────────────────────────────────────────────
    @Transactional
    public void supprimerAntecedentMedical(UUID antecId) {
        antecedentMedicalRepository.deleteById(antecId);
    }

    // ─────────────────────────────────────────────────────────
    // SUPPRIMER un antécédent familial
    // ─────────────────────────────────────────────────────────
    @Transactional
    public void supprimerAntecedentFamilial(UUID antecId) {
        antecedentFamilialRepository.deleteById(antecId);
    }

    // ─────────────────────────────────────────────────────────
    // MAPPERS PRIVÉS
    // ─────────────────────────────────────────────────────────
    private ConsultationResponseDTO buildResponse(
            ExamenManuel examen,
            List<AntecedentMedical> medicaux,
            List<AntecedentFamilial> familiaux) {

        ConsultationResponseDTO dto = new ConsultationResponseDTO();
        dto.setExamenManuel(toExamenDTO(examen));
        dto.setAntecedentsMedicaux(medicaux.stream().map(this::toAntecMedicalDTO).collect(Collectors.toList()));
        dto.setAntecedentsFamiliaux(familiaux.stream().map(this::toAntecFamilialDTO).collect(Collectors.toList()));
        return dto;
    }

    private ExamenManuelResponseDTO toExamenDTO(ExamenManuel e) {
        ExamenManuelResponseDTO dto = new ExamenManuelResponseDTO();
        dto.setId(e.getId());
        dto.setDate(e.getDate());
        dto.setSiteAnatomique(e.getSiteAnatomique());
        dto.setMassePalpee(e.getMassePalpee());
        dto.setLocalisationDeMasse(e.getLocalisationDeMasse());
        dto.setAspectPeau(e.getAspectPeau());
        dto.setAdenopathies(e.getAdenopathies());
        dto.setDescription(e.getDescription());
        dto.setNotes(e.getNotes());        // ← ajouter cette ligne
        dto.setVisiblePatient(e.getVisiblePatient());
        if (e.getAuteur() != null) {
            dto.setAuteurNom(e.getAuteur().getNom());
            dto.setAuteurPrenom(e.getAuteur().getPrenom());
        }
        return dto;
    }

    private AntecedentMedicalResponseDTO toAntecMedicalDTO(AntecedentMedical a) {
        AntecedentMedicalResponseDTO dto = new AntecedentMedicalResponseDTO();
        dto.setId(a.getId());
        dto.setMaladie(a.getMaladie());
        dto.setDateDiagnostic(a.getDateDiagnostic());
        dto.setStatut(a.getStatut());
        dto.setTraitements(a.getTraitements());
        return dto;
    }

    private AntecedentFamilialResponseDTO toAntecFamilialDTO(AntecedentFamilial a) {
        AntecedentFamilialResponseDTO dto = new AntecedentFamilialResponseDTO();
        dto.setId(a.getId());
        dto.setLienFamilial(a.getLienFamilial());
        dto.setMaladie(a.getMaladie());
        dto.setAgeSurvenue(a.getAgeSurvenue() != null ? Integer.parseInt(a.getAgeSurvenue()) : null);
        return dto;
    }
}