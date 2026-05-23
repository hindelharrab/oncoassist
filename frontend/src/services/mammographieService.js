import axiosInstance from './axiosInstance';

const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || null;
  } catch (err) {
    console.error('Erreur décodage token', err);
    return null;
  }
};

const mammographieService = {

  getHistorique: async (dossierId) => {
    const medecinId = getUserIdFromToken();
    console.log('mammographie medecinId:', medecinId); // ← temporaire
    const response = await axiosInstance.get(
      `/mammographie/dossier/${dossierId}`,
      medecinId ? { headers: { 'X-Medecin-Id': medecinId } } : {}
    );
    return response.data;
  },

  analyser: async (dossierId, imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    const medecinId = getUserIdFromToken();
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