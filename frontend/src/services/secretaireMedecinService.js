import axiosInstance from './axiosInstance';

const secretaireMedecinService = {
    getAll: async () => {
    const response = await axiosInstance.get('/medecins/ma-specialite');
    return response.data;
  },


  getById: async (id) => {
    const response = await axiosInstance.get(`/medecins/${id}`);
    return response.data;
  },
  

  getPlanning: async (medecinId, semaine = 0) => {
    const response = await axiosInstance.get(`/medecins/${medecinId}/planning`, {
      params: { semaine }
    });
    return response.data;
  }
};

export default secretaireMedecinService;