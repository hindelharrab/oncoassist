// src/services/patientService.js
import axiosInstance from './axiosInstance';

const patientService = {

  // Tous les patients
  getAll: async () => {
    const res = await axiosInstance.get('/patients');
    return res.data;
  },

  // Un patient par ID
  getById: async (id) => {
    const res = await axiosInstance.get(`/patients/${id}`);
    return res.data;
  },

  // Recherche par nom
  rechercher: async (nom) => {
    const res = await axiosInstance.get(
      `/patients/search?nom=${encodeURIComponent(nom)}`
    );
    return res.data;
  },

  // Créer un patient
  creer: async (data) => {
    const res = await axiosInstance.post('/patients', data);
    return res.data;
  },

  // Patients d'un médecin avec statut
  getByMedecinAvecStatut: async (medecinId) => {
    const res = await axiosInstance.get(
      `/patients/medecin/${medecinId}/avec-statut`
    );
    return res.data;
  }
};

export default patientService;