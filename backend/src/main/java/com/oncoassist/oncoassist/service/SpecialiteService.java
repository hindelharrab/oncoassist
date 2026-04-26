package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.entity.Specialite;
import com.oncoassist.oncoassist.repository.SpecialiteRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SpecialiteService {

    private final SpecialiteRepository specialiteRepository;

    public Specialite creer(Specialite specialite) {
        if (specialiteRepository.existsByNom(specialite.getNom())) {
            throw new IllegalArgumentException("Spécialité déjà existante : " + specialite.getNom());
        }
        return specialiteRepository.save(specialite);
    }

    public List<Specialite> findAll() {
        return specialiteRepository.findAll();
    }

    public Specialite findById(UUID id) {
        return specialiteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Spécialité non trouvée : " + id));
    }

    public Specialite modifier(UUID id, Specialite data) {
        Specialite specialite = findById(id);
        specialite.setNom(data.getNom());
        specialite.setDescription(data.getDescription());
        return specialiteRepository.save(specialite);
    }

    public void supprimer(UUID id) {
        Specialite specialite = findById(id);
        specialiteRepository.delete(specialite);
    }
}