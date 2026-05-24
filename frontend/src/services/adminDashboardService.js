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

export const getDashboardOverview = async () => {
  const { data } = await adminApi.get('/dashboard/overview');
  return data;
};

const adminDashboardService = { getOverview: getDashboardOverview };
export default adminDashboardService;