import axiosInstance from './axiosInstance';

export const loginUser = async (email, password) => {
  const { data } = await axiosInstance.post('/auth/login', { email, motDePasse: password });
  return data; // { token, role, ... }
};

export const forgotPassword = async (email) => {
  const { data } = await axiosInstance.post('/auth/forgot-password', { email });
  return data;
};

export const resetPassword = async (token, newPassword) => {
  const { data } = await axiosInstance.post('/auth/reset-password', { token, nouveauMotDePasse : newPassword });
  return data;
};
