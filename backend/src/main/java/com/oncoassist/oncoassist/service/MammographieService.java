package com.oncoassist.oncoassist.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.oncoassist.oncoassist.model.dto.mammographie.MammographieResponseDTO;
import com.oncoassist.oncoassist.model.dto.mammographie.MammographieResultDTO;
import com.oncoassist.oncoassist.model.entity.DossierMedical;
import com.oncoassist.oncoassist.model.entity.Mammographie;
import com.oncoassist.oncoassist.model.entity.Medecin;
import com.oncoassist.oncoassist.model.entity.enums.BIRADSEnum;
import com.oncoassist.oncoassist.model.entity.enums.NotificationCategorie;
import com.oncoassist.oncoassist.model.entity.enums.NotificationPriorite;
import com.oncoassist.oncoassist.repository.DossierMedicalRepository;
import com.oncoassist.oncoassist.repository.MammographieRepository;
import com.oncoassist.oncoassist.repository.MedecinRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class MammographieService {

    private final AiInferenceService       aiInferenceService;
    private final MammographieRepository   mammographieRepository;
    private final DossierMedicalRepository dossierMedicalRepository;
    private final MedecinRepository        medecinRepository;
    private final NotificationService      notificationService;  // ← AJOUT
    private final ObjectMapper             objectMapper = new ObjectMapper();

    @Value("${app.upload.mammographie.dir:uploads/mammo}")
    private String uploadDir;

    // Constructeur modifié avec NotificationService
    public MammographieService(
            AiInferenceService aiInferenceService,
            MammographieRepository mammographieRepository,
            DossierMedicalRepository dossierMedicalRepository,
            MedecinRepository medecinRepository,
            NotificationService notificationService) {  // ← AJOUT
        this.aiInferenceService       = aiInferenceService;
        this.mammographieRepository   = mammographieRepository;
        this.dossierMedicalRepository = dossierMedicalRepository;
        this.medecinRepository        = medecinRepository;
        this.notificationService      = notificationService;  // ← AJOUT
    }

    // ════════════════════════════════════════════════
    // ANALYSER + SAUVEGARDER
    // ════════════════════════════════════════════════
    @Transactional
    public MammographieResponseDTO analyzeAndSave(
            UUID patientId,
            MultipartFile imageFile,
            UUID medecinId) throws IOException {

        // 1. Chercher le dossier via le patient
        DossierMedical dossier = dossierMedicalRepository
                .findByPatientId(patientId)
                .orElseThrow(() -> new RuntimeException(
                        "Dossier non trouvé pour le patient : " + patientId
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

        // 4. Noms uniques — utilise dossier.getId()
        String timestamp = LocalDateTime.now().format(
                DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")
        );
        String uniqueId = UUID.randomUUID()
                .toString().substring(0, 8);
        String prefix = "mammo_" + dossier.getId()
                + "_" + timestamp + "_" + uniqueId;

        // 5. Sauvegarder les 3 images
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

        // 6. BBox JSON
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

        mammo.setScoreRisqueIA(aiResult.getScore().floatValue());
        mammo.setConfidencePct(
                aiResult.getConfidencePct().floatValue()
        );
        mammo.setPredictionIA(aiResult.getPrediction());
        mammo.setScoreBIRADS(
                BIRADSEnum.fromLabel(aiResult.getBiradsLabel())
        );
        mammo.setBiradsDescription(aiResult.getBiradsDescription());
        mammo.setRecommendationIA(aiResult.getRecommendation());
        mammo.setActionIA(aiResult.getAction());

        mammo.setQuadrant(aiResult.getQuadrant());
        mammo.setQuadrantShort(aiResult.getQuadrantShort());
        mammo.setPositionText(aiResult.getPositionText());
        mammo.setBboxJson(bboxJson);

        mammo.setImageRadio(pathOriginal);
        mammo.setHeatmapUrl(pathHeatmap);
        mammo.setBboxImageUrl(pathBbox);

        // 8. Sauvegarder en base
        Mammographie saved = mammographieRepository.save(mammo);

        // 9. 🔔 CRÉER UNE NOTIFICATION AUTOMATIQUE 🔔
        creerNotificationApresAnalyse(saved, dossier, medecinId);

        // 10. Retourner avec base64
        return buildResponse(saved, aiResult);
    }

    // ════════════════════════════════════════════════
    // MÉTHODE POUR CRÉER LA NOTIFICATION
    // ════════════════════════════════════════════════
    @Transactional
    private void creerNotificationApresAnalyse(Mammographie mammo, DossierMedical dossier, UUID medecinId) {
        // Déterminer la priorité selon le BI-RADS
        NotificationPriorite priorite;
        if (mammo.getScoreBIRADS() == null) {
            priorite = NotificationPriorite.INFO;
        } else {
            switch (mammo.getScoreBIRADS()) {
                case BIRADS_5, BIRADS_6 -> priorite = NotificationPriorite.CRITIQUE;
                case BIRADS_4B, BIRADS_4C -> priorite = NotificationPriorite.HAUTE;
                case BIRADS_4A -> priorite = NotificationPriorite.HAUTE;
                case BIRADS_3 -> priorite = NotificationPriorite.NORMALE;
                default -> priorite = NotificationPriorite.INFO;
            }
        }

        String biradsLabel = mammo.getScoreBIRADS() != null
                ? mammo.getScoreBIRADS().getLabel()
                : "Non évalué";

        String patientNom = dossier.getPatient() != null
                ? dossier.getPatient().getPrenom() + " " + dossier.getPatient().getNom()
                : "Patient inconnu";

        notificationService.creer(
                medecinId,
                NotificationCategorie.ia,
                priorite,
                biradsLabel + " détecté — " + mammo.getPredictionIA(),
                "Analyse EfficientNet-B3 terminée pour " + patientNom +
                        ". Confiance : " + mammo.getConfidencePct() + "%.",
                "/medecin/dossier/" + dossier.getPatient().getId() + "/mammographie",
                patientNom,
                dossier.getPatient().getId()
        );
    }

    // ════════════════════════════════════════════════
    // HISTORIQUE PAR PATIENT
    // ════════════════════════════════════════════════
    public List<MammographieResponseDTO> getByPatient(
            UUID patientId) {
        DossierMedical dossier = dossierMedicalRepository
                .findByPatientId(patientId)
                .orElseThrow(() -> new RuntimeException(
                        "Dossier non trouvé : " + patientId
                ));
        return mammographieRepository
                .findByDossierMedicalId(dossier.getId())
                .stream()
                .map(m -> buildResponse(m, null))
                .toList();
    }

    // ════════════════════════════════════════════════
    // MÉTHODES PRIVÉES (inchangées)
    // ════════════════════════════════════════════════
    @Transactional
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

        try (FileOutputStream fos = new FileOutputStream(filePath)) {
            fos.write(imageBytes);
        }

        return filePath;
    }

    private MammographieResponseDTO buildResponse(
            Mammographie mammo,
            MammographieResultDTO aiResult) {

        MammographieResponseDTO dto = new MammographieResponseDTO();

        dto.setId(mammo.getId());
        if (mammo.getDossierMedical() != null) {
            dto.setDossierId(mammo.getDossierMedical().getId());
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