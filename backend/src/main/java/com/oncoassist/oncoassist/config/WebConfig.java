package com.oncoassist.oncoassist.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        // Racine du projet (là où tourne Spring Boot)
        // ex: C:\Users\H-R\Desktop\PFA\oncoassist\backend
        String racine = Paths.get("").toAbsolutePath().toString();

        // 1. Photos de profil avec chemin complet
        //    stockées comme : "uploads/photos/xxx.jpg"
        //    URL : /uploads/photos/xxx.jpg
        registry.addResourceHandler("/uploads/photos/**")
                .addResourceLocations(
                        "file:" + racine + "/uploads/photos/"
                );

        // 2. Images mammographies
        //    stockées comme : "uploads/mammo/xxx.png"
        //    URL : /uploads/mammo/xxx.png
        registry.addResourceHandler("/uploads/mammo/**")
                .addResourceLocations(
                        "file:" + racine + "/uploads/mammo/"
                );

        // 3. Anciennes photos de profil stockées sans dossier
        //    stockées comme : "xxx.jpg" (ancien format)
        //    URL : /uploads/xxx.jpg → cherche dans uploads/photos/
        registry.addResourceHandler("/uploads/*.jpg",
                        "/uploads/*.png",
                        "/uploads/*.webp")
                .addResourceLocations(
                        "file:" + racine + "/uploads/photos/"
                );
    }
}