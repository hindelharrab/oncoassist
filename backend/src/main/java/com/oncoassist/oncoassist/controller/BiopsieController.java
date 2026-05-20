package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.dto.*;
import com.oncoassist.oncoassist.model.entity.Medecin;
import com.oncoassist.oncoassist.repository.MedecinRepository;
import com.oncoassist.oncoassist.security.JwtService;
import com.oncoassist.oncoassist.service.BiopsieService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/biopsies")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BiopsieController {

    private final BiopsieService    biopsieService;
    private final JwtService        jwtService;
    private final MedecinRepository medecinRepository;

    // ── Extraire le médecin depuis le token JWT
    private Medecin getMedecinFromToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        String token      = authHeader.substring(7);
        String email      = jwtService.extractEmail(token);
        System.out.println("✅ Email extrait du token : " + email);
        return medecinRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Médecin non trouvé : " + email));
    }

    // ── GET toutes les biopsies d'un dossier
    @GetMapping("/dossier/{patientId}")
    public ResponseEntity<List<BiopsieResponseDTO>> getByDossier(
            @PathVariable UUID patientId) {
        System.out.println("✅ GET biopsies patient : " + patientId);
        return ResponseEntity.ok(
                biopsieService.getByPatient(patientId)
        );
    }

    // ── GET une biopsie par ID
    @GetMapping("/{id}")
    public ResponseEntity<BiopsieResponseDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(biopsieService.getById(id));
    }

    // ── POST créer une biopsie
    @PostMapping
    public ResponseEntity<BiopsieResponseDTO> creer(
            @RequestBody BiopsieRequestDTO req,
            HttpServletRequest request
    ) {
        System.out.println("✅ POST créer biopsie - dossierId : " + req.getDossierId());
        Medecin medecin = getMedecinFromToken(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(biopsieService.creer(req, medecin.getId()));
    }

    // ── PUT modifier une biopsie
    @PutMapping("/{id}")
    public ResponseEntity<BiopsieResponseDTO> modifier(
            @PathVariable UUID id,
            @RequestBody BiopsieRequestDTO req
    ) {
        System.out.println("✅ PUT modifier biopsie : " + id);
        return ResponseEntity.ok(biopsieService.modifier(id, req));
    }

    // ── DELETE supprimer une biopsie
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable UUID id) {
        System.out.println("✅ DELETE biopsie : " + id);
        biopsieService.supprimer(id);
        return ResponseEntity.noContent().build();
    }

    // ── POST analyser des images
    @PostMapping(value = "/{id}/analyser",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AnalyseResultDTO> analyser(
            @PathVariable UUID id,
            @RequestParam("images") List<MultipartFile> images,
            @RequestParam("grossissement") String grossissement
    ) throws IOException {
        System.out.println("✅ POST analyser biopsie : " + id + " | images : " + images.size());
        return ResponseEntity.ok(biopsieService.analyser(id, images, grossissement));
    }
}