// ── services/adminSecretaireService.js ───────────────────────────────────────
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

const BASE       = '/admin/secretaires';
const BASE_CRUD  = '/secretaires';

// ── Lectures ──────────────────────────────────────────────────────────────────
export const getAllSecretaires  = async ()   => { const { data } = await adminApi.get(BASE);            return data; };
export const getSecretaireById = async (id) => { const { data } = await adminApi.get(`${BASE}/${id}`); return data; };

// ── Supprimer ─────────────────────────────────────────────────────────────────
export const deleteSecretaire = async (id) => {
  await adminApi.delete(`${BASE_CRUD}/${id}`);
};

// ── Modifier profil ───────────────────────────────────────────────────────────
export const updateProfil = async (id, payload) => {
  const { data } = await adminApi.put(`${BASE_CRUD}/${id}/profil`, payload);
  return data;
};

// ── Photo ─────────────────────────────────────────────────────────────────────
export const uploadPhoto = async (id, file) => {
  const formData = new FormData();
  formData.append('photo', file);
  const { data } = await adminApi.put(`${BASE_CRUD}/${id}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// ── Helper URL photo ──────────────────────────────────────────────────────────
export const getPhotoUrl = (photoProfil) => {
  if (!photoProfil) return null;
  if (photoProfil.startsWith('http')) return photoProfil;
  return `http://localhost:8080/uploads/photos/${photoProfil.replace(/^uploads\/photos\//, '')}`;
};

export const createSecretaire = async (payload) => {
  const { specialiteId, ...body } = payload;

  console.log("=== CREATE SECRETAIRE ===");
  console.log("Body envoyé :", body);
  console.log("specialiteId query param :", specialiteId);

  const { data } = await adminApi.post(BASE_CRUD, body, {
    params: specialiteId ? { specialiteId } : {},
  });

  console.log("Réponse backend :", data);
  return data;
};

export const getAllSpecialites = async () => {
  console.log("=== FETCH SPECIALITES ===");
  const { data } = await adminApi.get('/specialites');
  console.log("Spécialités reçues :", data);
  return data;
};


const adminSecretaireService = {
  getAll:           getAllSecretaires,
  getById:          getSecretaireById,
  create:           createSecretaire,
  delete:           deleteSecretaire,
  updateProfil,
  uploadPhoto,
  getPhotoUrl,
   getAllSpecialites,   // ajouté
};



export default adminSecretaireService;