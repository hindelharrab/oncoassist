// src/services/echographieService.js
import axiosInstance from './axiosInstance';

// GET /api/echographies/dossier/{dossierId}
export const getEchographies = async (dossierId) => {
  const { data } = await axiosInstance.get(`/echographies/dossier/${dossierId}`);
  return data;
};

// POST /api/echographies/dossier/{dossierId}
export const creerEchographie = async (dossierId, payload) => {
  const { data } = await axiosInstance.post(`/echographies/dossier/${dossierId}`, payload);
  return data;
};

// PUT /api/echographies/{id}
export const modifierEchographie = async (id, payload) => {
  const { data } = await axiosInstance.put(`/echographies/${id}`, payload);
  return data;
};

// DELETE /api/echographies/{id}
export const supprimerEchographie = async (id) => {
  await axiosInstance.delete(`/echographies/${id}`);
};