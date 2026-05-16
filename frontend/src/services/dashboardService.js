import axiosInstance from './axiosInstance';

const dashboardService = {
  /**
   * Récupère toutes les données du tableau de bord
   * @returns {Promise} - { kpis, biradsDistribution, examsEvolution, weeklyActivity, recentExams, todayAppointments }
   */
  getDashboardData: async () => {
    const response = await axiosInstance.get('/dashboard/data');
    return response.data;
  }
};

export default dashboardService;