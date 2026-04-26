package com.oncoassist.oncoassist.model.dto.auth;

import com.oncoassist.oncoassist.model.entity.enums.RoleEnum;
import lombok.*;

import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthResponse {
    private String token;
    private UUID id;
    private String nom;
    private String prenom;
    private String email;
    private RoleEnum role;
}
