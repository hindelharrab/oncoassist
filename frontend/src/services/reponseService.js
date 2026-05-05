import axiosInstance from '../axiosInstance';

export const reponseService = {
  // POST soumettre réponses (PATIENT)
  soumettre: (patientId, dto) =>
    axiosInstance.post(`/reponses/patient/${patientId}/soumettre`, dto),
  // dto = { attributionId, reponses: [{ questionId, choixSelectionne }] }

  // GET toutes les réponses d'un patient (MEDECIN)
  getToutesReponses: (patientId) =>
    axiosInstance.get(`/reponses/medecin/patient/${patientId}`),

  // GET réponses par question (MEDECIN) → graphiques
  getReponsesParQuestion: (patientId, questionId) =>
    axiosInstance.get(`/reponses/medecin/patient/${patientId}/question/${questionId}`),
};