package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.Secretaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SecretaireRepository extends JpaRepository<Secretaire, UUID> {
    boolean existsByEmail(String email);
    List<Secretaire> findBySpecialiteId(UUID specialiteId);
}