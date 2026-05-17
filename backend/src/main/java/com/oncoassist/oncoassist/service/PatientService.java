package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.PatientDetailDTO;
import com.oncoassist.oncoassist.model.dto.PatientRequestDTO;
import com.oncoassist.oncoassist.model.entity.AttributionQuestionnaire;
import com.oncoassist.oncoassist.model.entity.DossierMedical;
import com.oncoassist.oncoassist.model.entity.Patient;
import com.oncoassist.oncoassist.model.entity.enums.RoleEnum;
import com.oncoassist.oncoassist.model.entity.enums.StatutDossierEnum;
import com.oncoassist.oncoassist.repository.DossierMedicalRepository;
import com.oncoassist.oncoassist.repository.PatientRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.oncoassist.oncoassist.model.dto.PatientListItemDTO;
import com.oncoassist.oncoassist.model.entity.enums.StatutClinique;
import com.oncoassist.oncoassist.model.entity.Mammographie;
import com.oncoassist.oncoassist.model.entity.enums.BIRADSEnum;
import com.oncoassist.oncoassist.model.entity.enums.StatutDossierEnum;
import java.time.Period;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.io.IOException;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final DossierMedicalRepository dossierMedicalRepository;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Patient creer(PatientRequestDTO dto) {
        // Vérifier que l'email n'existe pas déjà
        if (patientRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email déjà utilisé : " + dto.getEmail());
        }

        Patient patient = new Patient();
        patient.setNom(dto.getNom());
        patient.setPrenom(dto.getPrenom());
        patient.setEmail(dto.getEmail());
        patient.setTelephone(dto.getTelephone());
        patient.setAdresse(dto.getAdresse());
        patient.setDateNaissance(dto.getDateNaissance());
        patient.setPersonneConfiance(dto.getPersonneConfiance());
        patient.setMotDePasse(passwordEncoder.encode(dto.getMotDePasse()));
        patient.setRole(RoleEnum.PATIENT);

        Patient saved = patientRepository.save(patient);

        // Créer le dossier médical associé
        DossierMedical dossier = new DossierMedical();
        dossier.setPatient(saved);
        dossier.setDateCreation(LocalDate.now());
        dossier.setStatut(StatutDossierEnum.ACTIF);
        dossierMedicalRepository.save(dossier);

        return saved;
    }
    @Transactional(readOnly = true)
    public List<PatientDetailDTO> findAll() {
        return patientRepository.findAll()
                .stream()
                .map(this::toDetailDTO)
                .collect(Collectors.toList());
    }

    public Patient findById(UUID id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Patient non trouvé : " + id));
    }

    public List<Patient> rechercher(String nom) {
        return patientRepository.findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(nom, nom);
    }

    public List<Patient> findByMedecin(UUID medecinId) {
        return patientRepository.findByMedecinActif(medecinId);
    }

    public Patient modifier(UUID id, Patient data, MultipartFile photo) throws IOException {
        Patient patient = findById(id);
        patient.setNom(data.getNom());
        patient.setPrenom(data.getPrenom());
        patient.setTelephone(data.getTelephone());
        patient.setAdresse(data.getAdresse());
        patient.setDateNaissance(data.getDateNaissance());
        patient.setPersonneConfiance(data.getPersonneConfiance());

        if (photo != null && !photo.isEmpty()) {
            fileStorageService.supprimerPhoto(patient.getPhotoProfil());
            patient.setPhotoProfil(fileStorageService.sauvegarderPhoto(photo));
        }
        if (data.getMotDePasse() != null && !data.getMotDePasse().isBlank()) {
            patient.setMotDePasse(passwordEncoder.encode(data.getMotDePasse()));
        }

        return patientRepository.save(patient);
    }

    public void supprimer(UUID id) {
        patientRepository.delete(findById(id));
    }

    // Endpoint principal — liste patients avec statut calculé
    public List<PatientListItemDTO> findByMedecinAvecStatut(UUID medecinId) {
        List<Patient> patients = patientRepository.findByMedecinActif(medecinId);
        return patients.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Conversion Patient → DTO
    private PatientListItemDTO toDTO(Patient patient) {
        DossierMedical dossier = patient.getDossierMedical();

        int nombreExamens = (dossier != null && dossier.getExamens() != null)
                ? dossier.getExamens().size() : 0;

        String dernierBIRADS = calculerDernierBIRADS(dossier);
        StatutClinique statut = calculerStatut(patient);
        boolean suiviActif = calculerSuiviActif(patient);

        int age = (patient.getDateNaissance() != null)
                ? Period.between(patient.getDateNaissance(), LocalDate.now()).getYears()
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
                .statut(statut)
                .dernierBIRADS(dernierBIRADS)
                .nombreExamens(nombreExamens)
                .suiviActif(suiviActif)
                .build();
    }

    // Calcul du statut clinique
    private StatutClinique calculerStatut(Patient patient) {
        DossierMedical dossier = patient.getDossierMedical();

        if (dossier == null)
            return StatutClinique.NOUVELLE;

        if (dossier.getStatut() == StatutDossierEnum.ARCHIVE)
            return StatutClinique.ARCHIVEE;

        if (dossier.getExamens() == null || dossier.getExamens().isEmpty())
            return StatutClinique.NOUVELLE;

        // Critique : BI-RADS 4A, 4B, 4C, 5 ou 6
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

        // À surveiller : BI-RADS 3
        boolean surveiller = dossier.getExamens().stream()
                .filter(e -> e instanceof Mammographie)
                .map(e -> (Mammographie) e)
                .anyMatch(m -> m.getScoreBIRADS() == BIRADSEnum.BIRADS_3);

        if (surveiller) return StatutClinique.A_SURVEILLER;

        if (calculerSuiviActif(patient)) return StatutClinique.EN_SUIVI;

        return StatutClinique.STABLE;
    }

    // Calcul du dernier BI-RADS
    private String calculerDernierBIRADS(DossierMedical dossier) {
        if (dossier == null || dossier.getExamens() == null)
            return "Non évalué";

        return dossier.getExamens().stream()
                .filter(e -> e instanceof Mammographie)
                .map(e -> (Mammographie) e)
                .filter(m -> m.getScoreBIRADS() != null)
                .max(Comparator.comparing(e -> e.getDate()))
                .map(m -> {
                    String name = m.getScoreBIRADS().name(); // "BIRADS_4"
                    return "BI-RADS " + name.replace("BIRADS_", ""); // "BI-RADS 4"
                })
                .orElse("Non évalué");
    }

    // Calcul suivi actif
    private boolean calculerSuiviActif(Patient patient) {
        return patient.getAttributions() != null &&
                patient.getAttributions().stream()
                        .anyMatch(AttributionQuestionnaire::getActif);
    }
    // APRÈS
    @Transactional(readOnly = true)
    public PatientDetailDTO findByIdDetail(UUID id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient introuvable : " + id));
        return toDetailDTO(patient);
    }
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
        dto.setRole(patient.getRole() != null ? patient.getRole().name() : null);
        dto.setPrisesEnCharge(patient.getPrisesEnCharge());
        dto.setRendezVous(patient.getRendezVous());
        if (patient.getDossierMedical() != null) {
            dto.setDossierMedicalId(patient.getDossierMedical().getId());
        }
        return dto;
    }
}