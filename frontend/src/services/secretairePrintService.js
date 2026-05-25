import axiosInstance from './axiosInstance';

const secretairePrintService = {

  // Patients de la spécialité de la secrétaire
  getAllPatients: async () => {
    const res = await axiosInstance.get('/secretaire/print/patients');
    return res.data;
  },

  // Rapport final JSON d'un patient (cheminFichier parsé)
  getRapportFinal: async (patientId) => {
    try {
      const res = await axiosInstance.get(
        `/secretaire/print/patients/${patientId}/rapport`
      );
      if (!res.data) return null;
      return typeof res.data === 'string'
        ? JSON.parse(res.data)
        : res.data;
    } catch {
      return null;
    }
  },

  // Garder pour compatibilité
  getBiopsies: async () => [],
  getPlansTraitement: async () => [],
  getRendezVous: async () => [],
};

export default secretairePrintService;