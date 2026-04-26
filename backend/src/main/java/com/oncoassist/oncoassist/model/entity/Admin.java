package com.oncoassist.oncoassist.model.entity;

import jakarta.persistence.*;
        import lombok.*;

@Entity
@Table(name = "admins")
@DiscriminatorValue("ADMIN") // role admin
@Getter @Setter @NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Admin extends Utilisateur {
}