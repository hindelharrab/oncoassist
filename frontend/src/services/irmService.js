// src/services/irmService.js
import axiosInstance from './axiosInstance';

// GET /api/irm/dossier/{dossierId}
export const getIRMs = async (dossierId) => {
  const { data } = await axiosInstance.get(`/irm/dossier/${dossierId}`);
  return data;
};

// POST /api/irm/dossier/{dossierId}
export const creerIRM = async (dossierId, payload) => {
  const { data } = await axiosInstance.post(`/irm/dossier/${dossierId}`, payload);
  return data;
};

// PUT /api/irm/{id}
export const modifierIRM = async (id, payload) => {
  const { data } = await axiosInstance.put(`/irm/${id}`, payload);
  return data;
};

// DELETE /api/irm/{id}
export const supprimerIRM = async (id) => {
  await axiosInstance.delete(`/irm/${id}`);
};