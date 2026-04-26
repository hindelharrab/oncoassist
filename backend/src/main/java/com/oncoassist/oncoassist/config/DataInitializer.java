package com.oncoassist.oncoassist.config;

import com.oncoassist.oncoassist.model.entity.Admin;
import com.oncoassist.oncoassist.model.entity.enums.RoleEnum;
import com.oncoassist.oncoassist.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!utilisateurRepository.existsByEmail("admin@oncoassist.ma")) {
            Admin admin = new Admin();
            admin.setNom("Admin");
            admin.setPrenom("Système");
            admin.setEmail("admin@oncoassist.ma");
            admin.setMotDePasse(passwordEncoder.encode("admin123"));
            admin.setTelephone("0600000000");
            admin.setRole(RoleEnum.ADMIN);

            utilisateurRepository.save(admin);
            System.out.println(" Admin par défaut créé : admin@oncoassist.ma / admin123");
        }
    }
}