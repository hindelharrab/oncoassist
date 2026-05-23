package com.oncoassist.oncoassist.model.dto.admin;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class AdminSpecialiteDTO {

    private UUID   id;
    private String nom;
    private String description;

    private int  nombreMedecins;
    private int  nombreSecretaires;
    private long nombrePatients;
    private long nombreRdvMois;
    private int  dureeConsultation;

    private List<MedecinDTO> medecins;

    @Data
    @Builder
    public static class MedecinDTO {
        private UUID   id;
        private String nom;
        private String prenom;
        private String photoProfil;
        private long   nombreRdv;
        private long   nombrePatients;
    }
}