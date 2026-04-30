import axiosInstance from './axiosInstance';

// Récupérer tous les patients d'un médecin avec leur statut clinique calculé
export const getPatientsAvecStatut = async (medecinId) => {
  const { data } = await axiosInstance.get(`/patients/medecin/${medecinId}/avec-statut`);
  return data;
};

// Récupérer un patient par son id
export const getPatientById = async (patientId) => {
  const { data } = await axiosInstance.get(`/patients/${patientId}`);
  return data;
};

// Recherche par nom
export const searchPatients = async (nom) => {
  const { data } = await axiosInstance.get(`/patients/search`, { params: { nom } });
  return data;
};