package com.oncoassist.oncoassist.model.dto.auth;

import com.oncoassist.oncoassist.model.entity.enums.RoleEnum;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor
public class RegisterRequest {
    @NotBlank
    private String nom;

    @NotBlank
    private String prenom;

    @NotBlank @Email
    private String email;

    @NotBlank @Size(min = 6, message = "Le mot de passe doit avoir au moins 6 caractères")
    private String motDePasse;

    private String telephone;

    @NotNull
    private RoleEnum role;

    // Pour Medecin
    private String numeroOrdre;
    private UUID specialiteId;

    // Pour Patient
    private LocalDate dateNaissance;
    private String adresse;
    private String personneConfiance;
}