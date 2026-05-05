package com.oncoassist.oncoassist.model.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class ChangePasswordDTO {
    private String ancienMotDePasse;
    private String nouveauMotDePasse;
}