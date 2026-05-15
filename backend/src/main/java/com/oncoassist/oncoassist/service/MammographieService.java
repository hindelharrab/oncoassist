package com.oncoassist.oncoassist.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.oncoassist.oncoassist.model.dto.mammographie.MammographieResponseDTO;
import com.oncoassist.oncoassist.model.dto.mammographie.MammographieResultDTO;
import com.oncoassist.oncoassist.model.entity.DossierMedical;
import com.oncoassist.oncoassist.model.entity.Mammographie;
import com.oncoassist.oncoassist.model.entity.Medecin;
import com.oncoassist.oncoassist.model.entity.enums.BIRADSEnum;
import com.oncoassist.oncoassist.repository.DossierMedicalRepository;
import com.oncoassist.oncoassist.repository.MammographieRepository;
import com.oncoassist.oncoassist.repository.MedecinRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class MammographieService {

    private final AiInferenceService       aiInferenceService;
    private final MammographieRepository   mammographieRepository;
    private final DossierMedicalRepository dossierMedicalRepository;
    private final MedecinRepository        medecinRepository;
    private final ObjectMapper             objectMapper = new ObjectMapper();

    @Value("${app.upload.mammographie.dir:uploads/mammo}")
    private String uploadDir;

    public MammographieService(
            AiInferenceService aiInferenceService,
            MammographieRepository mammographieRepository,
            DossierMedicalRepository dossierMedicalRepository,
            MedecinRepository medecinRepository) {
        this.aiInferenceService       = aiInferenceService;
        this.mammographieRepository   = mammographieRepository;
        this.dossierMedicalRepository = dossierMedicalRepository;
        this.medecinRepository        = medecinRepository;
    }

    // ════════════════════════════════════════════════
    // ANALYSER + SAUVEGARDER
    // ════════════════════════════════════════════════
    public MammographieResponseDTO analyzeAndSave(
            UUID dossierId,
            MultipartFile imageFile,
            UUID medecinId) throws IOException {

        // 1. Vérifier dossier
        DossierMedical dossier = dossierMedicalRepository
                .findById(dossierId)
                .orElseThrow(() -> new RuntimeException(
                        "Dossier non trouvé : " + dossierId
                ));

        // 2. Récupérer le médecin
        Medecin medecin = medecinRepository
                .findById(medecinId)
                .orElseThrow(() -> new RuntimeException(
                        "Médecin non trouvé : " + medecinId
                ));

        // 3. Appeler FastAPI Python
        MammographieResultDTO aiResult =
                aiInferenceService.analyze(imageFile);

        // 4. Noms fichiers uniques
        String timestamp = LocalDateTime.now().format(
                DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")
        );
        String uniqueId = UUID.randomUUID()
                .toString().substring(0, 8);
        String prefix = "mammo_" + dossierId
                + "_" + timestamp + "_" + uniqueId;

        // 5. Sauvegarder les 3 images sur disque
        String pathOriginal = saveBase64Image(
                aiResult.getImageOriginal(),
                prefix + "_original.png"
        );
        String pathHeatmap = saveBase64Image(
                aiResult.getImageHeatmap(),
                prefix + "_heatmap.png"
        );
        String pathBbox = saveBase64Image(
                aiResult.getImageBbox(),
                prefix + "_bbox.png"
        );

        // 6. BBox Map → JSON string
        String bboxJson = null;
        if (aiResult.getBbox() != null) {
            try {
                bboxJson = objectMapper.writeValueAsString(
                        aiResult.getBbox()
                );
            } catch (JsonProcessingException e) {
                bboxJson = "{}";
            }
        }

        // 7. Construire l'entité
        Mammographie mammo = new Mammographie();
        mammo.setDossierMedical(dossier);
        mammo.setAuteur(medecin);
        mammo.setDate(LocalDateTime.now());
        mammo.setVisiblePatient(false);

        // Résultats IA
        mammo.setScoreRisqueIA(
                aiResult.getScore().floatValue()
        );
        mammo.setConfidencePct(
                aiResult.getConfidencePct().floatValue()
        );
        mammo.setPredictionIA(aiResult.getPrediction());
        mammo.setScoreBIRADS(
                BIRADSEnum.fromLabel(aiResult.getBiradsLabel())
        );
        mammo.setBiradsDescription(
                aiResult.getBiradsDescription()
        );
        mammo.setRecommendationIA(aiResult.getRecommendation());
        mammo.setActionIA(aiResult.getAction());

        // Localisation
        mammo.setQuadrant(aiResult.getQuadrant());
        mammo.setQuadrantShort(aiResult.getQuadrantShort());
        mammo.setPositionText(aiResult.getPositionText());
        mammo.setBboxJson(bboxJson);

        // Chemins images
        mammo.setImageRadio(pathOriginal);
        mammo.setHeatmapUrl(pathHeatmap);
        mammo.setBboxImageUrl(pathBbox);

        // 8. Sauvegarder en base
        Mammographie saved = mammographieRepository.save(mammo);

        // 9. Retourner réponse avec base64
        return buildResponse(saved, aiResult);
    }

    // ════════════════════════════════════════════════
    // HISTORIQUE D'UN DOSSIER
    // ════════════════════════════════════════════════
    public List<MammographieResponseDTO> getByDossier(
            UUID dossierId) {
        return mammographieRepository
                .findByDossierMedicalId(dossierId)
                .stream()
                .map(m -> buildResponse(m, null))
                .toList();
    }

    // ════════════════════════════════════════════════
    // MÉTHODES PRIVÉES
    // ════════════════════════════════════════════════
    private String saveBase64Image(
            String base64Data,
            String filename) throws IOException {

        if (base64Data == null || base64Data.isEmpty()) {
            return null;
        }

        String base64 = base64Data;
        if (base64.contains(",")) {
            base64 = base64.split(",")[1];
        }

        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        byte[] imageBytes = Base64.getDecoder().decode(base64);
        String filePath   = uploadDir + "/" + filename;

        try (FileOutputStream fos =
                     new FileOutputStream(filePath)) {
            fos.write(imageBytes);
        }

        return filePath;
    }

    private MammographieResponseDTO buildResponse(
            Mammographie mammo,
            MammographieResultDTO aiResult) {

        MammographieResponseDTO dto =
                new MammographieResponseDTO();

        dto.setId(mammo.getId());
        if (mammo.getDossierMedical() != null) {
            dto.setDossierId(
                    mammo.getDossierMedical().getId()
            );
        }
        dto.setDateExamen(mammo.getDate());
        dto.setPredictionIA(mammo.getPredictionIA());
        dto.setScoreRisqueIA(mammo.getScoreRisqueIA());
        dto.setConfidencePct(mammo.getConfidencePct());
        dto.setScoreBIRADS(mammo.getScoreBIRADS());
        dto.setBiradsDescription(mammo.getBiradsDescription());
        dto.setRecommendationIA(mammo.getRecommendationIA());
        dto.setActionIA(mammo.getActionIA());
        dto.setQuadrant(mammo.getQuadrant());
        dto.setQuadrantShort(mammo.getQuadrantShort());
        dto.setPositionText(mammo.getPositionText());
        dto.setBboxJson(mammo.getBboxJson());
        dto.setImageRadio(mammo.getImageRadio());
        dto.setHeatmapUrl(mammo.getHeatmapUrl());
        dto.setBboxImageUrl(mammo.getBboxImageUrl());

        if (aiResult != null) {
            dto.setImageOriginal(aiResult.getImageOriginal());
            dto.setImageHeatmap(aiResult.getImageHeatmap());
            dto.setImageBbox(aiResult.getImageBbox());
        }

        return dto;
    }
}