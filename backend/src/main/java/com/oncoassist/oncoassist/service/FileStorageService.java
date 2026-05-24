package com.oncoassist.oncoassist.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(
            "image/jpeg", "image/png", "image/webp", "image/jfif",
            "image/pjpeg", "image/x-jfif-tbnail"
    );

    private static final List<String> ALLOWED_DOCUMENT_TYPES = List.of(
            "image/jpeg", "image/png", "image/webp",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/plain"
    );

    // ── Photos de profil (images uniquement) ──────────────────
    @Transactional
    public String sauvegarderPhoto(MultipartFile file) throws IOException {
        if (!ALLOWED_IMAGE_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException(
                    "Format non supporté. Utilisez JPG, PNG ou WEBP."
            );
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Fichier trop volumineux. Maximum 5MB.");
        }
        return sauvegarder(file);
    }

    // ── Documents médecin (PDF, Word, Excel, images) ─────────
    @Transactional
    public String sauvegarderDocument(MultipartFile file) throws IOException {
        if (!ALLOWED_DOCUMENT_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException(
                    "Format non supporté. Utilisez PDF, Word, Excel, JPG ou PNG."
            );
        }
        if (file.getSize() > 20 * 1024 * 1024) {
            throw new IllegalArgumentException("Fichier trop volumineux. Maximum 20MB.");
        }
        return sauvegarder(file);
    }

    // ── Méthode commune de sauvegarde ─────────────────────────
    private String sauvegarder(MultipartFile file) throws IOException {
        Path dossier = Paths.get(uploadDir);
        if (!Files.exists(dossier)) {
            Files.createDirectories(dossier);
        }
        String extension = getExtension(file.getOriginalFilename());
        String nomFichier = UUID.randomUUID() + "." + extension;
        Path chemin = dossier.resolve(nomFichier);
        Files.copy(file.getInputStream(), chemin, StandardCopyOption.REPLACE_EXISTING);
        return uploadDir + "/" + nomFichier;
    }

    @Transactional
    public void supprimerPhoto(String chemin) {
        if (chemin == null) return;
        try {
            Files.deleteIfExists(Paths.get(chemin));
        } catch (IOException e) {
            System.err.println("Impossible de supprimer : " + chemin);
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "bin";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}