package com.oncoassist.oncoassist.model.dto.admin;

import com.oncoassist.oncoassist.model.entity.enums.RoleEnum;
import lombok.Data;

import java.util.UUID;

@Data
public class SecretaireCreationDTO {
    private String nom;
    private String prenom;
    private String email;
    private String motDePasse;
    private String telephone;
    private RoleEnum role;
    private UUID specialiteId;
}