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

export const getProfile = async () => {
  const { data } = await adminApi.get('/admin/profile');
  return data;
};

export const updateProfile = async (payload) => {
  const { data } = await adminApi.put('/admin/profile', payload);
  return data;
};

export const updatePassword = async (payload) => {
  const { data } = await adminApi.put('/admin/profile/password', payload);
  return data;
};

export const updatePhoto = async (file) => {
  const formData = new FormData();
  formData.append('photo', file);
  const { data } = await adminApi.post('/admin/profile/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

const adminProfileService = { getProfile, updateProfile, updatePassword };
export default adminProfileService;