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

    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg", "image/png", "image/webp"
    );
    @Transactional
    public String sauvegarderPhoto(MultipartFile file)
            throws IOException {

        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException(
                    "Format non supporté. Utilisez JPG, PNG ou WEBP."
            );
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException(
                    "Fichier trop volumineux. Maximum 5MB."
            );
        }

        Path dossier = Paths.get(uploadDir);
        if (!Files.exists(dossier)) {
            Files.createDirectories(dossier);
        }

        String extension = getExtension(file.getOriginalFilename());
        String nomFichier = UUID.randomUUID() + "." + extension;
        Path chemin = dossier.resolve(nomFichier);
        Files.copy(
                file.getInputStream(), chemin,
                StandardCopyOption.REPLACE_EXISTING
        );

        // Retourner le chemin RELATIF complet
        // ex: "uploads/photos/abc-123.jpg"
        // Le frontend pourra accéder via :
        // http://localhost:8080/uploads/photos/abc-123.jpg
        return uploadDir + "/" + nomFichier;
    }
    @Transactional
    public void supprimerPhoto(String chemin) {
        if (chemin == null) return;
        try {
            // Le chemin est maintenant relatif → on le supprime directement
            Files.deleteIfExists(Paths.get(chemin));
        } catch (IOException e) {
            System.err.println(
                    "Impossible de supprimer : " + chemin
            );
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains("."))
            return "jpg";
        return filename
                .substring(filename.lastIndexOf('.') + 1)
                .toLowerCase();
    }
}