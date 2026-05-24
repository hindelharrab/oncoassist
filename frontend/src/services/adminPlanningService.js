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
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

export const getPlanningJour = async (medecinId, date) => {
  const params = { date: date.toISOString().split('T')[0] };
  if (medecinId) params.medecinId = medecinId;
  const { data } = await adminApi.get('/admin/planning/jour', { params });
  return data;
};

export const getPlanningSemaine = async (medecinId, dateDebut) => {
  const params = { dateDebut: dateDebut.toISOString().split('T')[0] };
  if (medecinId) params.medecinId = medecinId;
  const { data } = await adminApi.get('/admin/planning/semaine', { params });
  return data;
};

export const getPlanningMois = async (medecinId, year, month) => {
  const params = { year, month };
  if (medecinId) params.medecinId = medecinId;
  const { data } = await adminApi.get('/admin/planning/mois', { params });
  return data;
};

const adminPlanningService = { getJour: getPlanningJour, getSemaine: getPlanningSemaine, getMois: getPlanningMois };
export default adminPlanningService;