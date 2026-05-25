package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.Notification;
import com.oncoassist.oncoassist.model.entity.enums.NotificationCategorie;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository
        extends JpaRepository<Notification, UUID> {

    // ── MÉDECIN ───────────────────────────────────────────
    List<Notification> findByMedecinIdAndArchiveeFalseOrderByDateCreationDesc(UUID medecinId);
    List<Notification> findTop20ByArchiveeFalseOrderByDateCreationDesc();
    List<Notification> findByMedecinIdAndLueFalseAndArchiveeFalseOrderByDateCreationDesc(UUID medecinId);
    List<Notification> findByMedecinIdAndCategorieAndArchiveeFalseOrderByDateCreationDesc(UUID medecinId, NotificationCategorie categorie);
    List<Notification> findTop20ByArchiveeFalseAndCategorieIn(List<NotificationCategorie> categories, Sort sort);
    long countByMedecinIdAndLueFalseAndArchiveeFalse(UUID medecinId);
    long countByArchiveeFalseAndLueFalse();
    long countByArchiveeFalse();

    @Modifying
    @Query("UPDATE Notification n SET n.lue = true WHERE n.medecin.id = :medecinId")
    void markAllAsRead(@Param("medecinId") UUID medecinId);

    // ── PATIENT ───────────────────────────────────────────
    List<Notification> findByPatientDestinataireIdAndArchiveeFalseOrderByDateCreationDesc(UUID patientId);

    long countByPatientDestinataireIdAndLueFalseAndArchiveeFalse(UUID patientId);

    @Modifying
    @Query("UPDATE Notification n SET n.lue = true WHERE n.patientDestinataire.id = :patientId")
    void markAllAsReadForPatient(@Param("patientId") UUID patientId);
}