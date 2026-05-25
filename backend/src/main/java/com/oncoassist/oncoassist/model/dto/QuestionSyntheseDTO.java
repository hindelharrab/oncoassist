package com.oncoassist.oncoassist.model.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class QuestionSyntheseDTO {
    private UUID questionId;
    private String texte;
    private String type;       // "unique" ou "multiple"
    private boolean globale;
    // Pour unique : évolution dans le temps
    private List<ReponseParDate> evolution;
    // Pour multiple : fréquence de chaque choix
    private List<ChoixFrequence> repartition;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class ReponseParDate {
        private String date;
        private String choix;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class ChoixFrequence {
        private String choix;
        private long count;
    }
}