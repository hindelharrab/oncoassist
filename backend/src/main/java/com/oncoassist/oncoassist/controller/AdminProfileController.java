package com.oncoassist.oncoassist.controller;

import com.oncoassist.oncoassist.model.dto.admin.AdminProfileDTO;
import com.oncoassist.oncoassist.model.dto.admin.UpdatePasswordRequest;
import com.oncoassist.oncoassist.model.dto.admin.UpdateProfileRequest;
import com.oncoassist.oncoassist.security.JwtService;
import com.oncoassist.oncoassist.service.AdminProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/profile")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminProfileController {

    private final AdminProfileService profileService;
    private final JwtService          jwtService;

    // Extrait l'adminId depuis le token JWT
    private UUID extractAdminId(String authHeader) {
        String token = authHeader.substring(7);
        String userId = jwtService.extractUserId(token);
        return UUID.fromString(userId);
    }

    @GetMapping
    public ResponseEntity<AdminProfileDTO> getProfile(
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(profileService.getProfile(extractAdminId(authHeader)));
    }

    @PutMapping
    public ResponseEntity<AdminProfileDTO> updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(profileService.updateProfile(extractAdminId(authHeader), req));
    }

    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> updatePassword(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody UpdatePasswordRequest req) {
        profileService.updatePassword(extractAdminId(authHeader), req);
        return ResponseEntity.ok(Map.of("message", "Mot de passe mis à jour"));
    }
    @PostMapping("/photo")
    public ResponseEntity<AdminProfileDTO> updatePhoto(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("photo") MultipartFile photo) throws IOException {
        return ResponseEntity.ok(profileService.updatePhoto(extractAdminId(authHeader), photo));
    }
}