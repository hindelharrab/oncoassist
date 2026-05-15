// src/services/planTraitementService.js
import axiosInstance from './axiosInstance';

export const getPlansTraitement = async (dossierId) => {
  const { data } = await axiosInstance.get(`/plans-traitement/dossier/${dossierId}`);
  return data;
};

export const creerPlanTraitement = async (dossierId, payload) => {
  const { data } = await axiosInstance.post(`/plans-traitement/dossier/${dossierId}`, payload);
  return data;
};

export const modifierPlanTraitement = async (id, payload) => {
  const { data } = await axiosInstance.put(`/plans-traitement/${id}`, payload);
  return data;
};

export const supprimerPlanTraitement = async (id) => {
  await axiosInstance.delete(`/plans-traitement/${id}`);
};