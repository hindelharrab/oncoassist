import axiosInstance from './axiosInstance';

const secretaireSettingsService = {

  // Récupérer les infos de la secrétaire
  getProfil: async (id) => {
    const res = await axiosInstance.get(`/secretaires/${id}`);
    return res.data;
  },

  // Modifier le profil
  modifierProfil: async (id, data) => {
    const res = await axiosInstance.put(
      `/secretaires/${id}/profil`, data
    );
    return res.data;
  },

  // Changer le mot de passe
  changerMotDePasse: async (id, data) => {
    await axiosInstance.put(
      `/secretaires/${id}/change-password`, data
    );
  },

  // Changer la photo de profil
changerPhoto: async (id, file) => {
  const formData = new FormData();
  formData.append('photo', file); // ← "photo" correspond au @PutMapping
  const res = await axiosInstance.put(  // ← PUT, pas POST
    `/secretaires/${id}/photo`, formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return res.data;
}
};

export default secretaireSettingsService;