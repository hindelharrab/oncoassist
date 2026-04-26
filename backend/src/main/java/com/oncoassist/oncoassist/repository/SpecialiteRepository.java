package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.Specialite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpecialiteRepository extends JpaRepository<Specialite, UUID> {
    boolean existsByNom(String nom);
}