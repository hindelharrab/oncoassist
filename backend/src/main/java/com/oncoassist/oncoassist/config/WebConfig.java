package com.oncoassist.oncoassist.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absolutePath = Paths.get(uploadDir).toAbsolutePath().toString();
        System.out.println("Serving files from: " + absolutePath);

        //  /uploads/photos/** → pour les biopsies et gradcam
        registry.addResourceHandler("/uploads/photos/**")
                .addResourceLocations("file:" + absolutePath + "/");

        //  /uploads/** → pour les photos de profil (SettingsPage utilise ce chemin)
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + absolutePath + "/");
    }
}