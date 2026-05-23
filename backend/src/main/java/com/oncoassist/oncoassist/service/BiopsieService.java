package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.*;
import com.oncoassist.oncoassist.model.entity.*;
import com.oncoassist.oncoassist.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BiopsieService {

    private final BiopsieRepository      biopsieRepository;
    private final ImageAnalyseRepository imageAnalyseRepository;
    private final DossierMedicalRepository dossierMedicalRepository;
    private final MedecinRepository      medecinRepository;
    private final ResultatRepository     resultatRepository;
    private final RestTemplate           restTemplate;

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Value("${app.fastapi.url}")
    private String fastApiUrl;

    // ── Mapper entité → DTO
    private BiopsieResponseDTO toDTO(Biopsie b) {
        BiopsieResponseDTO dto = new BiopsieResponseDTO();
        dto.setId(b.getId());
        dto.setDate(b.getDate());
        dto.setSiteAnatomique(b.getSiteAnatomique());
        dto.setGrossissement(b.getGrossissement());
        dto.setVisiblePatient(b.getVisiblePatient());
        dto.setAuteurNom(b.getAuteur().getNom());
        dto.setAuteurPrenom(b.getAuteur().getPrenom());
        dto.setClasseBinaire(b.getClasseBinaire());
        dto.setScoreBenignMalin(b.getScoreBenignMalin());
        dto.setTypeTumeur(b.getTypeTumeur());
        dto.setScoreTypeConfiance(b.getScoreTypeConfiance());
        dto.setIsAnalysed(b.getClasseBinaire() != null);

        // ── Récupérer les notes depuis Resultat
        if (b.getResultat() != null) {
            dto.setNotes(b.getResultat().getInterpretation());
        } else {
            dto.setNotes(null);
        }


        // Force le chargement lazy
        List<ImageAnalyseDTO> images = new ArrayList<>();
        if (b.getImagesAnalysees() != null) {
            // Initialise la collection dans la transaction
            b.getImagesAnalysees().size(); // ← force le chargement
            images = b.getImagesAnalysees().stream().map(img -> {
                ImageAnalyseDTO imgDTO = new ImageAnalyseDTO();
                String chemin = img.getCheminImage();
                // Évite la duplication de chemin
                if (chemin != null && !chemin.startsWith("uploads/")) {
                    imgDTO.setCheminImage("/uploads/photos/" + chemin);
                } else {
                    imgDTO.setCheminImage("/" + chemin);
                }
                imgDTO.setId(img.getId());
                imgDTO.setCheminGradCam(
                        img.getCheminGradCam() != null
                                ? (img.getCheminGradCam().startsWith("uploads/")
                                ? "/" + img.getCheminGradCam()
                                : "/uploads/photos/" + img.getCheminGradCam())
                                : null
                );
                return imgDTO;
            }).collect(Collectors.toList());
        }
        dto.setImagesAnalysees(images);

        dto.setImagesAnalysees(images);
        return dto;
    }

    // ── Créer une biopsie
    @Transactional
    public BiopsieResponseDTO creer(BiopsieRequestDTO req, UUID medecinId) {
        DossierMedical dossier = dossierMedicalRepository
                .findByPatientId(req.getDossierId())
                .orElseThrow(() -> new RuntimeException(
                        "Dossier non trouvé pour patient : "
                                + req.getDossierId()
                ));
        Medecin medecin = medecinRepository.findById(medecinId)
                .orElseThrow(() -> new RuntimeException("Médecin non trouvé"));

        Biopsie biopsie = new Biopsie();
        biopsie.setDate(req.getDate() != null ? req.getDate() : LocalDateTime.now());
        biopsie.setSiteAnatomique(req.getSiteAnatomique());
        biopsie.setGrossissement(req.getGrossissement());
        biopsie.setVisiblePatient(req.getVisiblePatient() != null ? req.getVisiblePatient() : false);
        biopsie.setAuteur(medecin);
        biopsie.setDossierMedical(dossier);
        biopsie.setImagesAnalysees(new ArrayList<>());

        Biopsie saved = biopsieRepository.save(biopsie);

        // ── Créer le Resultat si notes fournies
        if (req.getNotes() != null && !req.getNotes().trim().isEmpty()) {
            Resultat resultat = new Resultat();
            resultat.setInterpretation(req.getNotes());
            resultat.setConclusion(req.getNotes());
            resultat.setDateRedaction(LocalDate.now());
            resultat.setVisiblePatient(req.getVisiblePatient() != null ? req.getVisiblePatient() : false);
            resultat.setExamen(saved);
            resultat.setAuteur(medecin);
            resultatRepository.save(resultat);
            saved.setResultat(resultat);
        }

        return toDTO(saved);
    }

    // ── Récupérer toutes les biopsies d'un patient

    @Transactional(readOnly = true)
    public List<BiopsieResponseDTO> getByDossier(UUID dossierId) {
        return biopsieRepository.findByDossierMedicalId(dossierId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }


    // ── Récupérer une biopsie par ID
    public BiopsieResponseDTO getById(UUID id) {
        Biopsie b = biopsieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Biopsie non trouvée"));
        return toDTO(b);
    }

    // ── Modifier une biopsie
    @Transactional
    public BiopsieResponseDTO modifier(UUID id, BiopsieRequestDTO req) {
        Biopsie b = biopsieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Biopsie non trouvée"));

        if (req.getSiteAnatomique() != null) b.setSiteAnatomique(req.getSiteAnatomique());
        if (req.getGrossissement()  != null) b.setGrossissement(req.getGrossissement());
        if (req.getVisiblePatient() != null) b.setVisiblePatient(req.getVisiblePatient());

        biopsieRepository.save(b);

        // ── Créer ou mettre à jour le Resultat si notes fournies
        if (req.getNotes() != null && !req.getNotes().trim().isEmpty()) {
            Resultat resultat = resultatRepository.findByExamenId(id)
                    .orElse(null);

            if (resultat == null) {
                // Créer nouveau Resultat
                resultat = new Resultat();
                resultat.setExamen(b);
                resultat.setAuteur(b.getAuteur());
                resultat.setDateRedaction(LocalDate.now());
                resultat.setVisiblePatient(b.getVisiblePatient());
            }

            // Mettre à jour les notes
            resultat.setInterpretation(req.getNotes());
            resultat.setConclusion(req.getNotes());
            resultatRepository.save(resultat);
        }

        // Recharger avec le résultat mis à jour
        Biopsie updated = biopsieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Biopsie non trouvée"));
        return toDTO(updated);
    }

    // ── Supprimer une biopsie
    @Transactional
    public void supprimer(UUID id) {
        biopsieRepository.deleteById(id);
    }

    @Transactional
    // ── Analyser des images via FastAPI
    public AnalyseResultDTO analyser(UUID biopsieId,
                                     List<MultipartFile> images,
                                     String grossissement) throws IOException {
        Biopsie biopsie = biopsieRepository.findById(biopsieId)
                .orElseThrow(() -> new RuntimeException("Biopsie non trouvée"));

        // ── 1. Sauvegarder les images sur le disque
        List<String> nomsFichiers = new ArrayList<>();
        for (MultipartFile image : images) {
            String nomFichier = UUID.randomUUID() + "_" + image.getOriginalFilename();
            Path chemin = Paths.get(uploadDir, nomFichier);
            Files.createDirectories(chemin.getParent());
            Files.write(chemin, image.getBytes());
            nomsFichiers.add(nomFichier);
        }

        // ── 2. Envoyer les images au FastAPI
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("grossissement", grossissement);

        for (MultipartFile img : images) {
            ByteArrayResource resource = new ByteArrayResource(img.getBytes()) {
                @Override public String getFilename() {
                    return img.getOriginalFilename();
                }
            };
            body.add("images", resource);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

        // ── 3. Appeler FastAPI
        ResponseEntity<Map> response = restTemplate.postForEntity(
                fastApiUrl + "/predict", request, Map.class
        );
        Map<String, Object> result = response.getBody();

        // ── 4. Récupérer les chemins Grad-CAM
        List<String> gradcamPaths = (List<String>) result.get("gradcam_paths");

        // ── 5. Sauvegarder les ImageAnalyse en BDD
        List<ImageAnalyse> imagesAnalysees = new ArrayList<>();
        for (int i = 0; i < nomsFichiers.size(); i++) {
            ImageAnalyse img = new ImageAnalyse();
            img.setCheminImage(nomsFichiers.get(i));
            img.setCheminGradCam(gradcamPaths != null && i < gradcamPaths.size()
                    ? gradcamPaths.get(i) : null);
            img.setBiopsie(biopsie);
            imagesAnalysees.add(imageAnalyseRepository.save(img));
        }

        // ── 6. Mettre à jour le résultat IA dans Biopsie
        biopsie.setClasseBinaire((String) result.get("classe_binaire"));
        biopsie.setScoreBenignMalin(((Number) result.get("score_benign_malin")).floatValue());
        biopsie.setTypeTumeur((String) result.get("type_tumeur"));
        biopsie.setScoreTypeConfiance(((Number) result.get("score_type_confiance")).floatValue());
        if (biopsie.getImagesAnalysees() == null) biopsie.setImagesAnalysees(new ArrayList<>());
        biopsie.getImagesAnalysees().addAll(imagesAnalysees);
        biopsieRepository.save(biopsie);

        // ── 7. Construire le DTO de retour
        AnalyseResultDTO dto = new AnalyseResultDTO();
        dto.setClasseBinaire((String) result.get("classe_binaire"));
        dto.setScoreBenignMalin(((Number) result.get("score_benign_malin")).floatValue());
        dto.setTypeTumeur((String) result.get("type_tumeur"));
        dto.setScoreTypeConfiance(((Number) result.get("score_type_confiance")).floatValue());
        dto.setImagesAnalysees(imagesAnalysees.stream().map(img -> {
            ImageAnalyseDTO imgDTO = new ImageAnalyseDTO();
            imgDTO.setId(img.getId());
            imgDTO.setCheminImage("/uploads/photos/" + img.getCheminImage());
            imgDTO.setCheminGradCam(img.getCheminGradCam() != null
                    ? "/uploads/photos/" + img.getCheminGradCam() : null);
            return imgDTO;
        }).collect(Collectors.toList()));

        return dto;
    }
    // Remplace getByDossier par getByPatient
    @Transactional(readOnly = true)
    public List<BiopsieResponseDTO> getByPatient(UUID patientId) {
        return biopsieRepository
                .findByPatientId(patientId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}