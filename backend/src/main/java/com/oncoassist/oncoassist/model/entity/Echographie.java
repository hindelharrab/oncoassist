package com.oncoassist.oncoassist.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "echographies")
@DiscriminatorValue("ECHOGRAPHIE")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)

public class Echographie extends Examen {

    @Column(name = "image_radio", nullable = false)
    private String imageRadio;

    @Column(name = "type_structure")
    private String typeStructure;
}