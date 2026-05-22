package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.Notification;
import com.oncoassist.oncoassist.model.entity.enums.NotificationCategorie;
import com.oncoassist.oncoassist.model.entity.enums.NotificationPriorite;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository
        extends JpaRepository<Notification, UUID> {

    // Toutes les notifications d'un médecin non archivées
    List<Notification> findByMedecinIdAndArchiveeFalseOrderByDateCreationDesc(
            UUID medecinId
    );
    List<Notification> findTop20ByArchiveeFalseOrderByDateCreationDesc();

    // Non lues uniquement
    List<Notification> findByMedecinIdAndLueFalseAndArchiveeFalseOrderByDateCreationDesc(
            UUID medecinId
    );

    // Par catégorie
    List<Notification> findByMedecinIdAndCategorieAndArchiveeFalseOrderByDateCreationDesc(
            UUID medecinId, NotificationCategorie categorie
    );
    List<Notification> findTop20ByArchiveeFalseAndCategorieIn(
            List<NotificationCategorie> categories,
            Sort sort
    );
    // Compter les non lues
    long countByMedecinIdAndLueFalseAndArchiveeFalse(UUID medecinId);

    // Marquer toutes comme lues
    @Modifying
    @Query("UPDATE Notification n SET n.lue = true WHERE n.medecin.id = :medecinId")
    void markAllAsRead(UUID medecinId);
    long countByArchiveeFalseAndLueFalse();
    long countByArchiveeFalse();
}