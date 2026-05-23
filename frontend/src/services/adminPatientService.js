// ── services/adminPatientService.js ──────────────────────────────────────────
// Utilise /api/admin/patients (endpoint dédié admin, données non sensibles)

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

const BASE = '/admin/patients';

export const getAllPatients    = async ()        => { const { data } = await adminApi.get(BASE); return data; };
export const getPatientById   = async (id)      => { const { data } = await adminApi.get(`${BASE}/${id}`); return data; };
export const searchPatients   = async (nom)     => { const { data } = await adminApi.get(`${BASE}/search`, { params: { nom } }); return data; };

export const getPhotoUrl = (photoProfil) => {
  if (!photoProfil) return null;
  if (photoProfil.startsWith('http')) return photoProfil;
  return `http://localhost:8080/uploads/photos/${photoProfil.replace(/^uploads\/photos\//, '')}`;
};

const adminPatientService = { getAll: getAllPatients, getById: getPatientById, search: searchPatients, getPhotoUrl };
export default adminPatientService;