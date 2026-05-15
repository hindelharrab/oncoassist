// src/services/biopsieService.js
import axiosInstance from './axiosInstance';

const BASE = '/biopsies';

// Récupérer toutes les biopsies d'un dossier
export const getBiopsiesByDossier = (dossierId) =>
  axiosInstance.get(`${BASE}/dossier/${dossierId}`);

// Récupérer une biopsie par ID
export const getBiopsieById = (id) =>
  axiosInstance.get(`${BASE}/${id}`);

// Créer une biopsie
export const creerBiopsie = (data) =>
  axiosInstance.post(BASE, data);

// Modifier une biopsie
export const modifierBiopsie = (id, data) =>
  axiosInstance.put(`${BASE}/${id}`, data);

// Supprimer une biopsie
export const supprimerBiopsie = (id) =>
  axiosInstance.delete(`${BASE}/${id}`);

// Analyser des images
export const analyserBiopsie = (biopsieId, images, grossissement) => {
  const formData = new FormData();
  formData.append('grossissement', grossissement);
  images.forEach(img => {
    // img.file = le vrai File object
    formData.append('images', img.file, img.name);
  });

  return axiosInstance.post(`${BASE}/${biopsieId}/analyser`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};