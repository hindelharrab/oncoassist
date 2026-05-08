// src/services/consultationService.js
import axiosInstance from './axiosInstance';

// ─────────────────────────────────────────────────────────────
// Récupérer toutes les consultations d'un dossier médical
// GET /api/consultations/dossier/{dossierId}
// ─────────────────────────────────────────────────────────────
export const getConsultations = async (dossierId) => {
  const { data } = await axiosInstance.get(`/consultations/dossier/${dossierId}`);
  return data;
};

// ─────────────────────────────────────────────────────────────
// Créer une nouvelle consultation complète
// POST /api/consultations/dossier/{dossierId}
// ─────────────────────────────────────────────────────────────
export const creerConsultation = async (dossierId, payload) => {
  const { data } = await axiosInstance.post(`/consultations/dossier/${dossierId}`, payload);
  return data;
};

// ─────────────────────────────────────────────────────────────
// Modifier un examen manuel existant
// PUT /api/consultations/examen/{examenId}
// ─────────────────────────────────────────────────────────────
export const modifierExamen = async (examenId, payload) => {
  const { data } = await axiosInstance.put(`/consultations/examen/${examenId}`, payload);
  return data;
};

// ─────────────────────────────────────────────────────────────
// Supprimer un examen manuel (= supprimer la consultation)
// DELETE /api/consultations/examen/{examenId}
// ─────────────────────────────────────────────────────────────
export const supprimerExamen = async (examenId) => {
  await axiosInstance.delete(`/consultations/examen/${examenId}`);
};

// ─────────────────────────────────────────────────────────────
// Supprimer un antécédent médical
// DELETE /api/consultations/antecedent-medical/{id}
// ─────────────────────────────────────────────────────────────
export const supprimerAntecedentMedical = async (id) => {
  await axiosInstance.delete(`/consultations/antecedent-medical/${id}`);
};

// ─────────────────────────────────────────────────────────────
// Supprimer un antécédent familial
// DELETE /api/consultations/antecedent-familial/{id}
// ─────────────────────────────────────────────────────────────
export const supprimerAntecedentFamilial = async (id) => {
  await axiosInstance.delete(`/consultations/antecedent-familial/${id}`);
};