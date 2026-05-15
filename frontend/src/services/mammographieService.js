import axiosInstance from './axiosInstance';

const mammographieService = {

  getHistorique: async (dossierId) => {
    const response = await axiosInstance.get(
      `/mammographie/dossier/${dossierId}`
    );
    return response.data;
  },

  // medecinId récupéré depuis localStorage
  analyser: async (dossierId, imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    // Récupérer le medecinId stocké au login
    const medecinId = localStorage.getItem('userId');

    const response = await axiosInstance.post(
      `/mammographie/dossier/${dossierId}/analyze?medecinId=${medecinId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 120000
      }
    );
    return response.data;
  }
};

export default mammographieService;