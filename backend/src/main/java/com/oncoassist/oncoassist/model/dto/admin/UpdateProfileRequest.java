package com.oncoassist.oncoassist.model.dto.admin;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String nom;
    private String prenom;
    private String telephone;
}