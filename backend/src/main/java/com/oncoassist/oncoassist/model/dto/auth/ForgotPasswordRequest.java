package com.oncoassist.oncoassist.model.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor
public class ForgotPasswordRequest {
    @NotBlank @Email
    private String email;
}
