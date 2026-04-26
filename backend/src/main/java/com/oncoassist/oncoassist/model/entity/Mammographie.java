package com.oncoassist.oncoassist.model.entity;

import com.oncoassist.oncoassist.model.entity.enums.BIRADSEnum;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mammographies")
@DiscriminatorValue("MAMMOGRAPHIE")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)

public class Mammographie extends Examen {

    @Column(name = "image_radio")
    private String imageRadio;

    @Enumerated(EnumType.STRING)
    @Column(name = "score_birads", nullable = false)
    private BIRADSEnum scoreBIRADS;

    @Column(name = "heatmap_url")
    private String heatmapUrl;

    @Column(name = "score_risque_ia")
    private Float scoreRisqueIA;
}