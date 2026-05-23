package com.oncoassist.oncoassist.model.dto.admin;

import lombok.Data;

@Data
public class UpdatePasswordRequest {
    private String motDePasseActuel;
    private String nouveauMotDePasse;
}