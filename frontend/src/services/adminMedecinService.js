// ── services/adminMedecinService.js ──────────────────────────────────────────
import axios from 'axios';

const adminApi = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminAuthenticated');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

const BASE = '/admin/medecins';

export const getAllMedecins  = async ()   => { const { data } = await adminApi.get(BASE); return data; };
export const getMedecinById = async (id) => { const { data } = await adminApi.get(`${BASE}/${id}`); return data; };

// dispos = [{ jour: "MONDAY", heureDebut: "09:00", heureFin: "17:00" }, ...]
export const updateDisponibilites = async (id, dispos) => {
  await adminApi.put(`${BASE}/${id}/disponibilites`, dispos);
};

export const addDocument = async (id, nom, typeDocument, fichier = null) => {
  const formData = new FormData();
  formData.append('nom', nom);
  formData.append('typeDocument', typeDocument);
  if (fichier) formData.append('fichier', fichier);
  await adminApi.post(`${BASE}/${id}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteDocument = async (medecinId, docId) => {
  await adminApi.delete(`${BASE}/${medecinId}/documents/${docId}`);
};

export const getPhotoUrl = (photoProfil) => {
  if (!photoProfil) return null;
  if (photoProfil.startsWith('http')) return photoProfil;
  return `http://localhost:8080/uploads/photos/${photoProfil.replace(/^uploads\/photos\//, '')}`;
};

export const getDocumentUrl = (cheminFichier) => {
  if (!cheminFichier) return null;
  if (cheminFichier.startsWith('http')) return cheminFichier;
  return `http://localhost:8080/uploads/photos/${cheminFichier.replace(/^uploads\/photos\//, '')}`;
};

const adminMedecinService = {
  getAll: getAllMedecins, getById: getMedecinById,
  updateDisponibilites, addDocument, deleteDocument,
  getPhotoUrl, getDocumentUrl,
};
export default adminMedecinService;