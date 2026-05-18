import axiosInstance from './axiosInstance';

const secretaireRendezVousService = {

  // Planning de la semaine
  getPlanning: async (dateDebut, medecinNom = null) => {
    const params = {
      semaine: dateDebut.toISOString().split('T')[0]
    };
    const res = await axiosInstance.get(
      '/rendez-vous/planning', { params }
    );
    return res.data;
  },

  // Créer un RDV
  creer: async (data) => {
    const res = await axiosInstance.post('/rendez-vous', data);
    return res.data;
  },

  // Modifier un RDV
  modifier: async (id, data) => {
    const res = await axiosInstance.put(
      `/rendez-vous/${id}`, data
    );
    return res.data;
  },

  // Annuler un RDV
  annuler: async (id) => {
    const res = await axiosInstance.put(
      `/rendez-vous/${id}/annuler`
    );
    return res.data;
  }
};

export default secretaireRendezVousService;