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

// ✅ endpoint admin enrichi avec stats
const BASE = '/admin/specialites';

export const getAllSpecialites  = async ()            => { const { data } = await adminApi.get(BASE);               return data; };
export const getSpecialiteById  = async (id)          => { const { data } = await adminApi.get(`${BASE}/${id}`);    return data; };
export const createSpecialite   = async (payload)     => { const { data } = await adminApi.post(BASE, payload);     return data; };
export const updateSpecialite   = async (id, payload) => { const { data } = await adminApi.put(`${BASE}/${id}`, payload); return data; };
export const deleteSpecialite   = async (id)          => { await adminApi.delete(`${BASE}/${id}`);                  };

const adminSpecialiteService = {
  getAll:  getAllSpecialites,
  getById: getSpecialiteById,
  create:  createSpecialite,
  update:  updateSpecialite,
  delete:  deleteSpecialite,
};
export default adminSpecialiteService;