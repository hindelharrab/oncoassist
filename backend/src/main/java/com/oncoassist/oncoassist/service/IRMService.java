package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.irm.IRMRequestDTO;
import com.oncoassist.oncoassist.model.dto.irm.IRMResponseDTO;
import com.oncoassist.oncoassist.model.entity.DossierMedical;
import com.oncoassist.oncoassist.model.entity.IRM;
import com.oncoassist.oncoassist.model.entity.Medecin;
import com.oncoassist.oncoassist.model.entity.enums.BIRADSEnum;
import com.oncoassist.oncoassist.repository.DossierMedicalRepository;
import com.oncoassist.oncoassist.repository.IRMRepository;
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
public class IRMService {

    private final IRMRepository irmRepository;
    private final DossierMedicalRepository dossierMedicalRepository;
    private final MedecinRepository medecinRepository;
    private final FileStorageService fileStorageService;

    // ─────────────────────────────────────────────────────────
    // CRÉER
    // ─────────────────────────────────────────────────────────
    @Transactional
    public IRMResponseDTO creer(UUID dossierId, IRMRequestDTO dto) {
        DossierMedical dossier = dossierMedicalRepository.findById(dossierId)
                .orElseThrow(() -> new RuntimeException("Dossier introuvable : " + dossierId));

        Medecin medecin = medecinRepository.findById(dto.getMedecinId())
                .orElseThrow(() -> new RuntimeException("Médecin introuvable : " + dto.getMedecinId()));

        IRM irm = new IRM();
        irm.setDate(LocalDateTime.now());
        irm.setDossierMedical(dossier);
        irm.setAuteur(medecin);
        irm.setVisiblePatient(false);
        // ✅ fichierImage null par défaut — pas de contrainte NOT NULL
        irm.setFichierImage(null);

        mapRequestToEntity(dto, irm);
        return toDTO(irmRepository.save(irm));
    }

    // ─────────────────────────────────────────────────────────
    // GET tous les examens d'un dossier
    // ─────────────────────────────────────────────────────────
    public List<IRMResponseDTO> getByDossier(UUID dossierId) {
        if (!dossierMedicalRepository.existsById(dossierId)) {
            throw new RuntimeException("Dossier introuvable : " + dossierId);
        }
        return irmRepository.findByDossierMedicalIdOrderByDateDesc(dossierId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────
    // MODIFIER
    // ─────────────────────────────────────────────────────────
    @Transactional
    public IRMResponseDTO modifier(UUID id, IRMRequestDTO dto) {
        IRM irm = irmRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("IRM introuvable : " + id));
        mapRequestToEntity(dto, irm);
        return toDTO(irmRepository.save(irm));
    }

    // ─────────────────────────────────────────────────────────
    // SUPPRIMER
    // ─────────────────────────────────────────────────────────
    @Transactional
    public void supprimer(UUID id) {
        IRM irm = irmRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("IRM introuvable : " + id));
        // Supprimer l'image si elle existe
        if (irm.getFichierImage() != null) {
            fileStorageService.supprimerPhoto(irm.getFichierImage());
        }
        irmRepository.delete(irm);
    }

    // ─────────────────────────────────────────────────────────
    // UPLOAD IMAGE — endpoint séparé pour éviter le NOT NULL
    // ─────────────────────────────────────────────────────────
    @Transactional
    public IRMResponseDTO uploadImage(UUID id, MultipartFile image) throws IOException {
        IRM irm = irmRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("IRM introuvable : " + id));

        // Supprimer l'ancienne image si elle existe
        if (irm.getFichierImage() != null) {
            fileStorageService.supprimerPhoto(irm.getFichierImage());
        }
        irm.setFichierImage(fileStorageService.sauvegarderPhoto(image));
        return toDTO(irmRepository.save(irm));
    }

    // ─────────────────────────────────────────────────────────
    // MAPPER Request → Entity
    // ─────────────────────────────────────────────────────────
    private void mapRequestToEntity(IRMRequestDTO dto, IRM irm) {
        irm.setSeinExamine(dto.getSeinExamine());
        irm.setSequences(dto.getSequences());
        irm.setQuadrant(dto.getQuadrant());
        irm.setFormeLesion(dto.getFormeLesion());
        irm.setContoursLesion(dto.getContoursLesion());
        irm.setSignalT2(dto.getSignalT2());
        irm.setTailleAxe1(dto.getTailleAxe1());
        irm.setTailleAxe2(dto.getTailleAxe2());
        irm.setTailleAxe3(dto.getTailleAxe3());
        irm.setTypeRehaussement(dto.getTypeRehaussement());
        irm.setCinematiqueRehaussement(dto.getCinematiqueRehaussement());
        irm.setValeurAdc(dto.getValeurAdc());
        irm.setRecommandation(dto.getRecommandation());
        irm.setResultatDetaille(dto.getResultatDetaille());

        // ✅ "Gadolinium" / "Non" → Boolean pour produitContraste
        irm.setProduitContraste(dto.getProduitContraste() != null
                && !dto.getProduitContraste().equalsIgnoreCase("Non")
                && !dto.getProduitContraste().isBlank());

        // ✅ "Oui"/"Non" → Boolean pour tous les booléens
        irm.setRestrictionDiffusion(ouiNon(dto.getRestrictionDiffusion()));
        irm.setAdenopathieAxillaire(ouiNon(dto.getAdenopathieAxillaire()));
        irm.setAdenopathieMediastinale(ouiNon(dto.getAdenopathieMediastinale()));
        irm.setExtensionParoi(ouiNon(dto.getExtensionParoi()));
        irm.setExtensionCutanee(ouiNon(dto.getExtensionCutanee()));

        // ✅ Score BI-RADS : le front envoie "4c", "5", "4C"...
        // On essaie de mapper vers l'enum, sinon on stocke dans recommandation
        if (dto.getScoreBIRADS() != null) {
            BIRADSEnum birads = parseBIRADS(dto.getScoreBIRADS());
            irm.setScoreBIRADS(birads);
        }
    }

    // ─────────────────────────────────────────────────────────
    // MAPPER Entity → ResponseDTO
    // ─────────────────────────────────────────────────────────
    private IRMResponseDTO toDTO(IRM i) {
        IRMResponseDTO dto = new IRMResponseDTO();
        dto.setId(i.getId());
        dto.setDate(i.getDate());
        dto.setVisiblePatient(i.getVisiblePatient());

        if (i.getAuteur() != null) {
            dto.setAuteurNom(i.getAuteur().getNom());
            dto.setAuteurPrenom(i.getAuteur().getPrenom());
        }

        dto.setSeinExamine(i.getSeinExamine());
        dto.setSequences(i.getSequences());
        dto.setQuadrant(i.getQuadrant());
        dto.setFormeLesion(i.getFormeLesion());
        dto.setContoursLesion(i.getContoursLesion());
        dto.setSignalT2(i.getSignalT2());
        dto.setTailleAxe1(i.getTailleAxe1());
        dto.setTailleAxe2(i.getTailleAxe2());
        dto.setTailleAxe3(i.getTailleAxe3());
        dto.setTypeRehaussement(i.getTypeRehaussement());
        dto.setCinematiqueRehaussement(i.getCinematiqueRehaussement());
        dto.setValeurAdc(i.getValeurAdc());
        dto.setRecommandation(i.getRecommandation());
        dto.setResultatDetaille(i.getResultatDetaille());
        dto.setFichierImage(i.getFichierImage());

        // ✅ Boolean → String pour le front
        dto.setProduitContraste(Boolean.TRUE.equals(i.getProduitContraste()) ? "Gadolinium" : "Non");
        dto.setRestrictionDiffusion(boolToStr(i.getRestrictionDiffusion()));
        dto.setAdenopathieAxillaire(boolToStr(i.getAdenopathieAxillaire()));
        dto.setAdenopathieMediastinale(boolToStr(i.getAdenopathieMediastinale()));
        dto.setExtensionParoi(boolToStr(i.getExtensionParoi()));
        dto.setExtensionCutanee(boolToStr(i.getExtensionCutanee()));

        // ✅ BIRADSEnum → String
        if (i.getScoreBIRADS() != null) {
            dto.setScoreBIRADS(i.getScoreBIRADS().name().replace("BIRADS_", ""));
        }

        return dto;
    }

    // ─────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────
    private Boolean ouiNon(String val) {
        return "Oui".equalsIgnoreCase(val);
    }

    private String boolToStr(Boolean val) {
        return Boolean.TRUE.equals(val) ? "Oui" : "Non";
    }

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
}