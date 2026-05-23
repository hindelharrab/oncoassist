package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.DocumentMedecin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentMedecinRepository extends JpaRepository<DocumentMedecin, UUID> {
    List<DocumentMedecin> findByMedecinId(UUID medecinId);
    void deleteByMedecinId(UUID medecinId);
}