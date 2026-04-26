package com.oncoassist.oncoassist.model.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor
public class ResetPasswordRequest {
    @NotBlank
    private String token;

    @NotBlank @Size(min = 6)
    private String nouveauMotDePasse;
}
