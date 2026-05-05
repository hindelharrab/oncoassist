import axiosInstance from '../axiosInstance';

export const questionnaireService = {
  // GET questions globales (MEDECIN)
  getGlobales: () =>
    axiosInstance.get('/questionnaire/globales'),

  // GET questions d'un patient (MEDECIN)
  getQuestionsPatient: (patientId) =>
    axiosInstance.get(`/questionnaire/patient/${patientId}`),

  // POST question globale (MEDECIN)
  ajouterGlobale: (dto) =>
    axiosInstance.post('/questionnaire/globale', dto),
  // dto = { texte, choix: [], ordre }

  // POST question custom pour un patient (MEDECIN)
  ajouterCustom: (patientId, dto) =>
    axiosInstance.post(`/questionnaire/patient/${patientId}/ajouter`, dto),

  // DELETE question (MEDECIN)
  supprimer: (questionId) =>
    axiosInstance.delete(`/questionnaire/${questionId}`),

  // POST attribuer questionnaire (MEDECIN)
  attribuer: (dto) =>
    axiosInstance.post('/questionnaire/attribuer', dto),
  // dto = { patientId, medecinId, frequence, dateFin }
};