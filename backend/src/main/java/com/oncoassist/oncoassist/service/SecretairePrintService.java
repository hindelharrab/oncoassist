package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.SecretairePrintPatientDTO;
import com.oncoassist.oncoassist.model.entity.*;
import com.oncoassist.oncoassist.model.entity.enums.DocTypeEnum;
import com.oncoassist.oncoassist.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SecretairePrintService {

    private final SecretaireRepository    secretaireRepository;
    private final MedecinRepository       medecinRepository;
    private final PriseEnChargeRepository priseEnChargeRepository;
    private final DocumentRepository      documentRepository;

    public List<SecretairePrintPatientDTO> getPatientsDeSpecialite(String emailSecretaire) {

        Secretaire secretaire = secretaireRepository.findByEmail(emailSecretaire)
                .orElseThrow(() -> new EntityNotFoundException("Secrétaire non trouvée"));

        if (secretaire.getSpecialite() == null) return List.of();

        UUID specialiteId = secretaire.getSpecialite().getId();

        // Médecins de la spécialité
        List<Medecin> medecins = medecinRepository.findBySpecialiteId(specialiteId);
        List<UUID> medecinIds = medecins.stream().map(Medecin::getId).toList();

        // Patients via PriseEnCharge
        List<PriseEnCharge> prises = priseEnChargeRepository
                .findByMedecinIdIn(medecinIds);

        // Dédupliquer les patients
        Map<UUID, PriseEnCharge> patientMap = new LinkedHashMap<>();
        for (PriseEnCharge pec : prises) {
            Patient p = pec.getPatient();
            if (p != null && !patientMap.containsKey(p.getId())) {
                patientMap.put(p.getId(), pec);
            }
        }

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy",
                java.util.Locale.FRENCH);

        return patientMap.values().stream().map(pec -> {
            Patient p   = pec.getPatient();
            Medecin med = pec.getMedecin();

            // Age
            Integer age = null;
            if (p.getDateNaissance() != null) {
                age = Period.between(p.getDateNaissance(), LocalDate.now()).getYears();
            }

            // A-t-il un RAPPORT_FINAL ?
            boolean hasRapport = false;
            if (p.getDossierMedical() != null) {
                hasRapport = documentRepository
                        .existsByDossierMedicalIdAndType(
                                p.getDossierMedical().getId(),
                                DocTypeEnum.RAPPORT_FINAL);
            }

            // Dernière consultation
            String derniereConsultation = null;
            if (p.getDossierMedical() != null) {
                documentRepository
                        .findTopByDossierMedicalIdOrderByDateAjoutDesc(
                                p.getDossierMedical().getId())
                        .ifPresent(doc -> {
                        });
                // Utiliser la date de dernière prise en charge
                if (pec.getDateDebut() != null) {
                    derniereConsultation = pec.getDateDebut().format(fmt);
                }
            }

            return SecretairePrintPatientDTO.builder()
                    .id(p.getId())
                    .nom(p.getNom())
                    .prenom(p.getPrenom())
                    .email(p.getEmail())
                    .telephone(p.getTelephone())
                    .adresse(p.getAdresse() != null ? p.getAdresse() : "")
                    .dateNaissance(p.getDateNaissance() != null
                            ? p.getDateNaissance().toString() : null)
                    .age(age)
                    .statut(p.getDossierMedical() != null
                            ? p.getDossierMedical().getStatut() != null
                              ? p.getDossierMedical().getStatut().name()
                              : null
                            : null)
                    .photoProfil(p.getPhotoProfil())
                    .medecinRef(med != null
                            ? med.getPrenom() + " " + med.getNom() : null)
                    .dossierMedicalId(p.getDossierMedical() != null
                            ? p.getDossierMedical().getId() : null)
                    .hasRapportFinal(hasRapport)
                    .derniereConsultation(derniereConsultation)
                    .build();

        }).toList();
    }

    public String getRapportFinalJson(UUID patientId) {
        // Chercher le dernier RAPPORT_FINAL du dossier de ce patient
        return documentRepository
                .findTopByDossierMedical_Patient_IdAndTypeOrderByDateAjoutDesc(
                        patientId, DocTypeEnum.RAPPORT_FINAL)
                .map(Document::getCheminFichier)
                .orElse(null);
    }
}