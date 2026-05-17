import axiosInstance from './axiosInstance';

const getUserIdFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return decoded.userId || decoded.id || decoded.sub;
  } catch { return null; }
};

const notificationService = {

  getAll: async () => {
    const medecinId = getUserIdFromToken();
    const response = await axiosInstance.get(`/notifications/medecin/${medecinId}`);
    return response.data;
  },

  countNonLues: async () => {
    const medecinId = getUserIdFromToken();
    const response = await axiosInstance.get(`/notifications/medecin/${medecinId}/count`);
    return response.data.nonLues;
  },

  marquerLue: async (id) => {
    const response = await axiosInstance.patch(`/notifications/${id}/lue`);
    return response.data;
  },

  marquerToutesLues: async () => {
    const medecinId = getUserIdFromToken();
    await axiosInstance.patch(`/notifications/medecin/${medecinId}/tout-lire`);
  },

  archiver: async (id) => {
    await axiosInstance.patch(`/notifications/${id}/archiver`);
  }
};

export default notificationService;