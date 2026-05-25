import axiosInstance from './axiosInstance';

const secretaireDashboardService = {
  getDashboard: async () => {
    const res = await axiosInstance.get('/secretaire/dashboard');
    return res.data;
  },
};

export default secretaireDashboardService;