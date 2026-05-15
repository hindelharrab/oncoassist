// src/services/documentService.js
import axiosInstance from './axiosInstance';

// GET ordonnances d'un dossier
export const getOrdonnances = async (dossierId) => {
  const { data } = await axiosInstance.get(`/documents/dossier/${dossierId}/ordonnances`);
  return data;
};

// GET résultats d'un dossier
export const getResultats = async (dossierId) => {
  const { data } = await axiosInstance.get(`/documents/dossier/${dossierId}/resultats`);
  return data;
};

// POST créer un document (ordonnance manuelle ou résultat)
export const creerDocument = async (dossierId, payload) => {
  const { data } = await axiosInstance.post(`/documents/dossier/${dossierId}`, payload);
  return data;
};

// PUT modifier un document
export const modifierDocument = async (id, payload) => {
  const { data } = await axiosInstance.put(`/documents/${id}`, payload);
  return data;
};

// DELETE supprimer un document
export const supprimerDocument = async (id) => {
  await axiosInstance.delete(`/documents/${id}`);
};

// PUT toggle visibilité patient
export const toggleVisibilite = async (id) => {
  const { data } = await axiosInstance.put(`/documents/${id}/visibilite`);
  return data;
};