package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.PatientDetailDTO;
import com.oncoassist.oncoassist.model.dto.PatientListItemDTO;
import com.oncoassist.oncoassist.model.dto.PatientRequestDTO;
import com.oncoassist.oncoassist.model.entity.*;
import com.oncoassist.oncoassist.model.entity.enums.*;
import com.oncoassist.oncoassist.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PatientService {

    private final PatientRepository        patientRepository;
    private final DossierMedicalRepository dossierMedicalRepository;
    private final FileStorageService       fileStorageService;
    private final PasswordEncoder          passwordEncoder;
    private final PriseEnChargeService     priseEnChargeService;
    // ════════════════════════════════════════════════
    // CRÉER
    // ════════════════════════════════════════════════
    @Transactional
    public Patient creer(PatientRequestDTO dto) {
        if (patientRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException(
                    "Email déjà utilisé : " + dto.getEmail()
            );
        }

        Patient patient = new Patient();
        patient.setNom(dto.getNom());
        patient.setPrenom(dto.getPrenom());
        patient.setEmail(dto.getEmail());
        patient.setTelephone(dto.getTelephone());
        patient.setAdresse(dto.getAdresse());
        patient.setDateNaissance(dto.getDateNaissance());
        patient.setPersonneConfiance(dto.getPersonneConfiance());
        patient.setMotDePasse(passwordEncoder.encode(
                dto.getMotDePasse() != null
                        ? dto.getMotDePasse()
                        : "ChangeMe2026!"
        ));
        patient.setRole(RoleEnum.PATIENT);

        Patient saved = patientRepository.save(patient);

        // Dossier médical
        DossierMedical dossier = new DossierMedical();
        dossier.setPatient(saved);
        dossier.setDateCreation(LocalDate.now());
        dossier.setStatut(StatutDossierEnum.ACTIF);
        dossierMedicalRepository.save(dossier);

        // Affecter médecin référent si fourni
        if (dto.getMedecinId() != null) {
            priseEnChargeService.affecter(
                    saved.getId(), dto.getMedecinId()
            );
        }

        return saved;
    }

    // ════════════════════════════════════════════════
    // LIRE
    // ════════════════════════════════════════════════
    @Transactional(readOnly = true)
    public List<PatientDetailDTO> findAll() {
        return patientRepository.findAll()
                .stream()
                .map(this::toDetailDTO)
                .collect(Collectors.toList());
    }

    public Patient findById(UUID id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Patient non trouvé : " + id
                ));
    }

    @Transactional(readOnly = true)
    public PatientDetailDTO findByIdDetail(UUID id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Patient introuvable : " + id
                ));
        return toDetailDTO(patient);
    }

    public List<Patient> rechercher(String nom) {
        return patientRepository
                .findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(
                        nom, nom
                );
    }

    public List<Patient> findByMedecin(UUID medecinId) {
        return patientRepository.findByMedecinActif(medecinId);
    }

    // ════════════════════════════════════════════════
    // MODIFIER
    // ════════════════════════════════════════════════
    @Transactional
    public Patient modifier(
            UUID id, Patient data, MultipartFile photo)
            throws IOException {
        Patient patient = findById(id);
        patient.setNom(data.getNom());
        patient.setPrenom(data.getPrenom());
        patient.setTelephone(data.getTelephone());
        patient.setAdresse(data.getAdresse());
        patient.setDateNaissance(data.getDateNaissance());
        patient.setPersonneConfiance(data.getPersonneConfiance());

        if (photo != null && !photo.isEmpty()) {
            fileStorageService.supprimerPhoto(
                    patient.getPhotoProfil()
            );
            patient.setPhotoProfil(
                    fileStorageService.sauvegarderPhoto(photo)
            );
        }
        if (data.getMotDePasse() != null
                && !data.getMotDePasse().isBlank()) {
            patient.setMotDePasse(
                    passwordEncoder.encode(data.getMotDePasse())
            );
        }

        return patientRepository.save(patient);
    }

    // ════════════════════════════════════════════════
    // SUPPRIMER
    // ════════════════════════════════════════════════
    @Transactional
    public void supprimer(UUID id) {
        patientRepository.delete(findById(id));
    }

    // ════════════════════════════════════════════════
    // LISTE AVEC STATUT (vue médecin)
    // ════════════════════════════════════════════════
    public List<PatientListItemDTO> findByMedecinAvecStatut(
            UUID medecinId) {
        return patientRepository.findByMedecinActif(medecinId)
                .stream()
                .map(this::toListItemDTO)
                .collect(Collectors.toList());
    }
    public List<PatientDetailDTO> rechercherDTO(String nom) {
        return patientRepository
                .findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(
                        nom, nom
                )
                .stream()
                .map(this::toDetailDTO)
                .collect(Collectors.toList());
    }

    // ════════════════════════════════════════════════
    // MAPPERS
    // ════════════════════════════════════════════════

    // ── DTO détail complet ─────────────────────────
    private PatientDetailDTO toDetailDTO(Patient patient) {
        PatientDetailDTO dto = new PatientDetailDTO();
        dto.setId(patient.getId());
        dto.setNom(patient.getNom());
        dto.setPrenom(patient.getPrenom());
        dto.setEmail(patient.getEmail());
        dto.setTelephone(patient.getTelephone());
        dto.setDateNaissance(patient.getDateNaissance());
        dto.setAdresse(patient.getAdresse());
        dto.setPersonneConfiance(patient.getPersonneConfiance());
        dto.setPhotoProfil(patient.getPhotoProfil());
        dto.setRole(patient.getRole() != null
                ? patient.getRole().name() : null);

        if (patient.getDossierMedical() != null) {
            dto.setDossierMedicalId(
                    patient.getDossierMedical().getId()
            );
        }

        // Âge calculé
        if (patient.getDateNaissance() != null) {
            dto.setAge(Period.between(
                    patient.getDateNaissance(),
                    LocalDate.now()
            ).getYears());
        }

        // Statut clinique
        dto.setStatut(calculerStatut(patient));

        // Médecin référent (prise en charge active)
        if (patient.getPrisesEnCharge() != null) {
            patient.getPrisesEnCharge().stream()
                    .filter(pec -> pec.getDateFin() == null)
                    .findFirst()
                    .ifPresent(pec -> {
                        if (pec.getMedecin() != null) {
                            dto.setMedecinRef(
                                    pec.getMedecin().getNom()
                            );
                            dto.setMedecinId(
                                    pec.getMedecin().getId()
                            );
                        }
                    });
        }

        // Dernière consultation
        if (patient.getRendezVous() != null
                && !patient.getRendezVous().isEmpty()) {
            patient.getRendezVous().stream()
                    .filter(rdv -> rdv.getDate() != null)
                    .max(Comparator.comparing(
                            rdv -> rdv.getDate()
                    ))
                    .ifPresent(rdv ->
                            dto.setDerniereConsultation(
                                    rdv.getDate()
                                            .toLocalDate()
                                            .format(
                                                    DateTimeFormatter
                                                            .ofPattern("dd MMM yyyy")
                                            )
                            )
                    );
        }

        // Nombre d'examens
        if (patient.getDossierMedical() != null
                && patient.getDossierMedical()
                .getExamens() != null) {
            dto.setNombreExamens(
                    patient.getDossierMedical()
                            .getExamens().size()
            );
        }

        return dto;
    }

    // ── DTO liste (vue médecin) ────────────────────
    private PatientListItemDTO toListItemDTO(Patient patient) {
        DossierMedical dossier = patient.getDossierMedical();

        int nombreExamens = (dossier != null
                && dossier.getExamens() != null)
                ? dossier.getExamens().size() : 0;

        int age = (patient.getDateNaissance() != null)
                ? Period.between(
                patient.getDateNaissance(),
                LocalDate.now()
        ).getYears()
                : 0;

        return PatientListItemDTO.builder()
                .id(patient.getId())
                .nom(patient.getNom())
                .prenom(patient.getPrenom())
                .email(patient.getEmail())
                .telephone(patient.getTelephone())
                .adresse(patient.getAdresse())
                .personneConfiance(patient.getPersonneConfiance())
                .dateNaissance(patient.getDateNaissance())
                .age(age)
                .statut(calculerStatut(patient))
                .dernierBIRADS(calculerDernierBIRADS(dossier))
                .nombreExamens(nombreExamens)
                .suiviActif(calculerSuiviActif(patient))
                .build();
    }

    // ════════════════════════════════════════════════
    // HELPERS CALCUL STATUT
    // ════════════════════════════════════════════════
    private StatutClinique calculerStatut(Patient patient) {
        DossierMedical dossier = patient.getDossierMedical();

        if (dossier == null)
            return StatutClinique.NOUVELLE;

        if (dossier.getStatut() == StatutDossierEnum.ARCHIVE)
            return StatutClinique.ARCHIVEE;

        if (dossier.getExamens() == null
                || dossier.getExamens().isEmpty())
            return StatutClinique.NOUVELLE;

        boolean critique = dossier.getExamens().stream()
                .filter(e -> e instanceof Mammographie)
                .map(e -> (Mammographie) e)
                .anyMatch(m -> m.getScoreBIRADS() != null &&
                        (m.getScoreBIRADS() == BIRADSEnum.BIRADS_4A
                                || m.getScoreBIRADS() == BIRADSEnum.BIRADS_4B
                                || m.getScoreBIRADS() == BIRADSEnum.BIRADS_4C
                                || m.getScoreBIRADS() == BIRADSEnum.BIRADS_5
                                || m.getScoreBIRADS() == BIRADSEnum.BIRADS_6));

        if (critique) return StatutClinique.CRITIQUE;

        boolean surveiller = dossier.getExamens().stream()
                .filter(e -> e instanceof Mammographie)
                .map(e -> (Mammographie) e)
                .anyMatch(m ->
                        m.getScoreBIRADS() == BIRADSEnum.BIRADS_3
                );

        if (surveiller) return StatutClinique.A_SURVEILLER;

        if (calculerSuiviActif(patient))
            return StatutClinique.EN_SUIVI;

        return StatutClinique.STABLE;
    }

    private String calculerDernierBIRADS(
            DossierMedical dossier) {
        if (dossier == null || dossier.getExamens() == null)
            return "Non évalué";

        return dossier.getExamens().stream()
                .filter(e -> e instanceof Mammographie)
                .map(e -> (Mammographie) e)
                .filter(m -> m.getScoreBIRADS() != null)
                .max(Comparator.comparing(e -> e.getDate()))
                .map(m -> "BI-RADS " + m.getScoreBIRADS()
                        .name().replace("BIRADS_", ""))
                .orElse("Non évalué");
    }

    private boolean calculerSuiviActif(Patient patient) {
        return patient.getAttributions() != null
                && patient.getAttributions().stream()
                .anyMatch(AttributionQuestionnaire::getActif);
    }
}