import axiosInstance from './axiosInstance';

const secretaireDashboardService = {

  getStats: async () => {
    const res = await axiosInstance.get(
      '/dashboard/secretaire/stats'
    );
    return res.data;
  },

  getRdvAujourdhui: async () => {
    try {
      const today = new Date()
        .toISOString().split('T')[0];
      const res = await axiosInstance.get(
        `/rendez-vous/planning?date=${today}`
      );
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      return [];
    }
  },

  getMedecins: async () => {
    try {
      const res = await axiosInstance.get(
        '/medecins/avec-statut'
      );
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      return [];
    }
  }
};

export default secretaireDashboardService;