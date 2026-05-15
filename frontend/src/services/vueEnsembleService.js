// src/services/vueEnsembleService.js
import axiosInstance from './axiosInstance';

/**
 * Récupère toutes les données de la page VueEnsemble pour un patient donné.
 * @param {string} patientId - UUID du patient
 * @returns {Promise<VueEnsembleData>}
 */
export const getVueEnsemble = async (patientId) => {
  const { data } = await axiosInstance.get(`/patients/${patientId}/vue-ensemble`);
  return data;
};