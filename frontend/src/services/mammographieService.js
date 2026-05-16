import axiosInstance from './axiosInstance';

// Fonction pour extraire le userId depuis le token JWT
const getUserIdFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    // Décoder le token (partie centrale)
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.userId;  // ← récupère l'userId du payload
  } catch (err) {
    console.error('Erreur décodage token', err);
    return null;
  }
};

const mammographieService = {

  getHistorique: async (dossierId) => {
    const response = await axiosInstance.get(
      `/mammographie/dossier/${dossierId}`
    );
    return response.data;
  },

  analyser: async (dossierId, imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    const medecinId = getUserIdFromToken();  // ← extrait du token
    if (!medecinId) {
      throw new Error('Session expirée — reconnectez-vous');
    }

    const response = await axiosInstance.post(
      `/mammographie/dossier/${dossierId}/analyze?medecinId=${medecinId}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000
      }
    );
    return response.data;
  }
};

export default mammographieService;