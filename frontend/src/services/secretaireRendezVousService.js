import axiosInstance from './axiosInstance';

const secretaireRendezVousService = {

  // Planning de la semaine
  getPlanning: async (dateDebut) => {
    const semaine = dateDebut instanceof Date
      ? dateDebut.toISOString().split('T')[0]
      : dateDebut;

    const res = await axiosInstance.get(
      '/rendez-vous/planning',
      { params: { semaine } }
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
  },

  // Planifier un RDV (secrétaire confirme)
  planifier: async (id, date, lieu) => {
    const res = await axiosInstance.put(
      `/rendez-vous/${id}/planifier`,
      { date, lieu }
    );
    return res.data;
  },

  getDemandesEnAttente: async () => {
  const res = await axiosInstance.get('/rendez-vous/en-attente');
  return res.data;
},

  // Marquer effectué
  marquerEffectue: async (id) => {
    const res = await axiosInstance.put(
      `/rendez-vous/${id}/effectue`
    );
    return res.data;
  }

  

};

export default secretaireRendezVousService;