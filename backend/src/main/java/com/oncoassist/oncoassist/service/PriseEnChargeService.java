package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.entity.Medecin;
import com.oncoassist.oncoassist.model.entity.Patient;
import com.oncoassist.oncoassist.model.entity.PriseEnCharge;
import com.oncoassist.oncoassist.model.entity.enums.RolePECEnum;
import com.oncoassist.oncoassist.repository.MedecinRepository;
import com.oncoassist.oncoassist.repository.PatientRepository;
import com.oncoassist.oncoassist.repository.PriseEnChargeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.oncoassist.oncoassist.model.dto.PriseEnChargeResponseDTO;
import java.util.stream.Collectors;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PriseEnChargeService {

    private final PriseEnChargeRepository priseEnChargeRepository;
    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;

    // Secrétaire affecte un médecin à un patient
    @Transactional
    public PriseEnCharge affecter(UUID patientId, UUID medecinId) {

        // Vérifier que le patient existe
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient non trouvé"));

        // Vérifier que le médecin existe
        Medecin medecin = medecinRepository.findById(medecinId)
                .orElseThrow(() -> new EntityNotFoundException("Médecin non trouvé"));

        // Vérifier qu'une prise en charge active n'existe pas déjà
        if (priseEnChargeRepository.existsByPatientIdAndMedecinIdAndDateFinIsNull(patientId, medecinId)) {
            throw new IllegalArgumentException("Ce médecin est déjà affecté à ce patient");
        }

        PriseEnCharge pec = new PriseEnCharge();
        pec.setPatient(patient);
        pec.setMedecin(medecin);
        pec.setDateDebut(LocalDate.now());
        pec.setRole(RolePECEnum.REFERENT);
        pec.setAccesEcriture(true);

        return priseEnChargeRepository.save(pec);
    }

    // Clôturer une prise en charge (transfert ou fin de suivi)
    @Transactional
    public PriseEnCharge cloturer(UUID id, String motif) {
        PriseEnCharge pec = priseEnChargeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Prise en charge non trouvée"));
        pec.setDateFin(LocalDate.now());
        pec.setMotifTransfert(motif);
        pec.setAccesEcriture(false);
        return priseEnChargeRepository.save(pec);
    }

    // Liste des prises en charge d'un patient
    public List<PriseEnCharge> findByPatient(UUID patientId) {
        return priseEnChargeRepository.findByPatientId(patientId);
    }

    // Liste des prises en charge d'un médecin
    public List<PriseEnCharge> findByMedecin(UUID medecinId) {
        return priseEnChargeRepository.findByMedecinId(medecinId);
    }
    @Transactional(readOnly = true)
    public List<PriseEnChargeResponseDTO> findByPatientDTO(UUID patientId) {
        return priseEnChargeRepository.findByPatientId(patientId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    private PriseEnChargeResponseDTO toDTO(PriseEnCharge pec) {
        PriseEnChargeResponseDTO dto = new PriseEnChargeResponseDTO();
        dto.setId(pec.getId());
        dto.setDateDebut(pec.getDateDebut());
        dto.setDateFin(pec.getDateFin());
        dto.setRole(pec.getRole() != null ? pec.getRole().name() : null);
        dto.setAccesEcriture(pec.getAccesEcriture());

        // ✅ On accède au médecin ici (dans la session Hibernate)
        if (pec.getMedecin() != null) {
            dto.setMedecinId(pec.getMedecin().getId());
            dto.setMedecinNom(pec.getMedecin().getNom());
            dto.setMedecinPrenom(pec.getMedecin().getPrenom());
            dto.setMedecinSpecialite(
                    pec.getMedecin().getSpecialite() != null
                            ? pec.getMedecin().getSpecialite().getNom()
                            : null
            );
        }
        return dto;
    }
}