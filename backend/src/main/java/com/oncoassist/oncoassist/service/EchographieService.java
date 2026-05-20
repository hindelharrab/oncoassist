package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.echographie.EchographieRequestDTO;
import com.oncoassist.oncoassist.model.dto.echographie.EchographieResponseDTO;
import com.oncoassist.oncoassist.model.entity.DossierMedical;
import com.oncoassist.oncoassist.model.entity.Echographie;
import com.oncoassist.oncoassist.model.entity.Medecin;
import com.oncoassist.oncoassist.model.entity.enums.BIRADSEnum;
import com.oncoassist.oncoassist.repository.DossierMedicalRepository;
import com.oncoassist.oncoassist.repository.EchographieRepository;
import com.oncoassist.oncoassist.repository.MedecinRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EchographieService {

    private final EchographieRepository echographieRepository;
    private final DossierMedicalRepository dossierMedicalRepository;
    private final MedecinRepository medecinRepository;
    private final FileStorageService fileStorageService; // ← ajouter

    // ─────────────────────────────────────────────────────────
    // CRÉER un examen d'échographie
    // ─────────────────────────────────────────────────────────
    @Transactional
    public EchographieResponseDTO creer(UUID dossierId, EchographieRequestDTO dto) {

        DossierMedical dossier = dossierMedicalRepository.findById(dossierId)
                .orElseThrow(() -> new RuntimeException("Dossier introuvable : " + dossierId));

        Medecin medecin = medecinRepository.findById(dto.getMedecinId())
                .orElseThrow(() -> new RuntimeException("Médecin introuvable : " + dto.getMedecinId()));

        Echographie echo = new Echographie();
        echo.setDate(LocalDateTime.now());
        echo.setDossierMedical(dossier);
        echo.setAuteur(medecin);
        echo.setVisiblePatient(false);

        mapRequestToEntity(dto, echo);

        return toDTO(echographieRepository.save(echo));
    }

    // ─────────────────────────────────────────────────────────
    // GET tous les examens d'un dossier
    // ─────────────────────────────────────────────────────────
    public List<EchographieResponseDTO> getByDossier(UUID dossierId) {
        if (!dossierMedicalRepository.existsById(dossierId)) {
            throw new RuntimeException("Dossier introuvable : " + dossierId);
        }
        return echographieRepository.findByDossierMedicalIdOrderByDateDesc(dossierId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────
    // MODIFIER
    // ─────────────────────────────────────────────────────────
    @Transactional
    public EchographieResponseDTO modifier(UUID id, EchographieRequestDTO dto) {
        Echographie echo = echographieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Echographie introuvable : " + id));
        mapRequestToEntity(dto, echo);
        return toDTO(echographieRepository.save(echo));
    }

    // ─────────────────────────────────────────────────────────
    // SUPPRIMER
    // ─────────────────────────────────────────────────────────
    @Transactional
    public void supprimer(UUID id) {
        echographieRepository.deleteById(id);
    }

    // ─────────────────────────────────────────────────────────
    // MAPPER Request → Entity
    // ─────────────────────────────────────────────────────────
    private void mapRequestToEntity(EchographieRequestDTO dto, Echographie echo) {
        echo.setSeinExamine(dto.getSeinExamine());
        echo.setQuadrant(dto.getQuadrant());
        echo.setDistanceMamelon(dto.getDistanceMamelon());
        echo.setTypeStructure(dto.getTypeStructure());
        echo.setForme(dto.getForme());
        echo.setOrientation(dto.getOrientation());
        echo.setContours(dto.getContours());
        echo.setEchostructure(dto.getEchostructure());
        echo.setTailleAxe1(dto.getTailleAxe1());
        echo.setTailleAxe2(dto.getTailleAxe2());
        echo.setTailleAxe3(dto.getTailleAxe3());
        echo.setEffetsPosterieurs(dto.getEffetsPosterieurs());
        echo.setVascularisationDoppler(dto.getVascularisationDoppler());
        echo.setRecommandation(dto.getRecommandation());
        echo.setResultatDetaille(dto.getResultatDetaille());
        echo.setImageRadio(dto.getImageRadio());

        // "Oui"/"Non" → Boolean
        echo.setCalcificationsPresentes("Oui".equalsIgnoreCase(dto.getCalcificationsPresentes()));
        echo.setAdenopathieAxillaire("Oui".equalsIgnoreCase(dto.getAdenopathieAxillaire()));

        // "1"..."6" → BIRADSEnum
        if (dto.getScoreBIRADS() != null) {
            echo.setScoreBIRADS(parseBIRADS(dto.getScoreBIRADS()));
        }
    }

    // ─────────────────────────────────────────────────────────
    // MAPPER Entity → ResponseDTO
    // ─────────────────────────────────────────────────────────
    private EchographieResponseDTO toDTO(Echographie e) {
        EchographieResponseDTO dto = new EchographieResponseDTO();
        dto.setId(e.getId());
        dto.setDate(e.getDate());
        dto.setVisiblePatient(e.getVisiblePatient());

        if (e.getAuteur() != null) {
            dto.setAuteurNom(e.getAuteur().getNom());
            dto.setAuteurPrenom(e.getAuteur().getPrenom());
        }

        dto.setSeinExamine(e.getSeinExamine());
        dto.setQuadrant(e.getQuadrant());
        dto.setDistanceMamelon(e.getDistanceMamelon());
        dto.setTypeStructure(e.getTypeStructure());
        dto.setForme(e.getForme());
        dto.setOrientation(e.getOrientation());
        dto.setContours(e.getContours());
        dto.setEchostructure(e.getEchostructure());
        dto.setTailleAxe1(e.getTailleAxe1());
        dto.setTailleAxe2(e.getTailleAxe2());
        dto.setTailleAxe3(e.getTailleAxe3());
        dto.setEffetsPosterieurs(e.getEffetsPosterieurs());
        dto.setVascularisationDoppler(e.getVascularisationDoppler());
        dto.setRecommandation(e.getRecommandation());
        dto.setResultatDetaille(e.getResultatDetaille());
        dto.setImageRadio(e.getImageRadio());

        // Boolean → "Oui"/"Non" pour le front
        dto.setCalcificationsPresentes(Boolean.TRUE.equals(e.getCalcificationsPresentes()) ? "Oui" : "Non");
        dto.setAdenopathieAxillaire(Boolean.TRUE.equals(e.getAdenopathieAxillaire()) ? "Oui" : "Non");

        // BIRADSEnum → "1"..."6"
        if (e.getScoreBIRADS() != null) {
            dto.setScoreBIRADS(e.getScoreBIRADS().name().replace("BIRADS_", ""));
        }

        return dto;
    }

    // ─────────────────────────────────────────────────────────
    // HELPER — "1"..."6" → BIRADSEnum
    // ─────────────────────────────────────────────────────────
    private BIRADSEnum parseBIRADS(String value) {
        if (value == null) return null;
        return switch (value.trim().toUpperCase()) {
            case "0"   -> BIRADSEnum.BIRADS_0;
            case "1"   -> BIRADSEnum.BIRADS_1;
            case "2"   -> BIRADSEnum.BIRADS_2;
            case "3"   -> BIRADSEnum.BIRADS_3;
            case "4",
                 "4A"  -> BIRADSEnum.BIRADS_4A;
            case "4B"  -> BIRADSEnum.BIRADS_4B;
            case "4C"  -> BIRADSEnum.BIRADS_4C;
            case "5"   -> BIRADSEnum.BIRADS_5;
            case "6"   -> BIRADSEnum.BIRADS_6;
            default    -> BIRADSEnum.BIRADS_1;
        };
    }
    @Transactional
    public EchographieResponseDTO uploadImage(UUID id, MultipartFile image) throws IOException {
        Echographie echo = echographieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Echographie introuvable : " + id));

        if (echo.getImageRadio() != null) {
            fileStorageService.supprimerPhoto(echo.getImageRadio());
        }
        echo.setImageRadio(fileStorageService.sauvegarderPhoto(image));
        return toDTO(echographieRepository.save(echo));
    }
}