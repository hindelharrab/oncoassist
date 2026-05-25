import axiosInstance from './axiosInstance';

const secretairePrintService = {

  // Liste tous les patients avec détails complets
  getAllPatients: async () => {
    const res = await axiosInstance.get('/patients');
    return res.data;
  },

  // Détail complet d'un patient pour le rapport
  getPatientDetail: async (patientId) => {
    const res = await axiosInstance.get(
      `/patients/${patientId}`
    );
    return res.data;
  },

  // Biopsies d'un patient
  getBiopsies: async (patientId) => {
    const res = await axiosInstance.get(
      `/biopsies/dossier/${patientId}`
    );
    return res.data;
  },

  // Mammographies d'un patient
  getMammographies: async (patientId) => {
    try {
      const res = await axiosInstance.get(
        `/mammographie/dossier/${patientId}`
      );
      return res.data;
    } catch {
      return [];
    }
  },

  // Plans de traitement d'un patient
  getPlansTraitement: async (patientId) => {
    try {
      const res = await axiosInstance.get(
        `/plans-traitement/dossier/${patientId}`
      );
      return res.data;
    } catch {
      return [];
    }
  },

  // RDV d'un patient
  getRendezVous: async (patientId) => {
    try {
      const res = await axiosInstance.get(
        `/rendez-vous/patient/${patientId}`
      );
      return res.data;
    } catch {
      return [];
    }
  }
};

export default secretairePrintService;