import axiosInstance from './axiosInstance';

const secretaireNotificationService = {

  // Notifications pour la secrétaire
  // utilise l'endpoint /secretaire/{id}
  getAll: async (secretaireId) => {
    try {
      const res = await axiosInstance.get(
        `/notifications/secretaire/${secretaireId}`
      );
      return res.data;
    } catch {
      return [];
    }
  },

  marquerLue: async (id) => {
    await axiosInstance.patch(`/notifications/${id}/lue`);
  },

  marquerToutesLues: async (medecinId) => {
    await axiosInstance.patch(
      `/notifications/medecin/${medecinId}/tout-lire`
    );
  },

  supprimer: async (id) => {
    await axiosInstance.patch(`/notifications/${id}/archiver`);
  }
};

export default secretaireNotificationService;