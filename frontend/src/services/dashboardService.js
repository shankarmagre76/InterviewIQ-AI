import { api } from './api';
import { API_ENDPOINTS } from '../constants/appConstants';

export const dashboardService = {
  async getMainDashboard(params = {}) {
    const response = await api.get(API_ENDPOINTS.DASHBOARD.BASE, { params });
    return response.data;
  },

  async getResumeDashboard(params = {}) {
    const response = await api.get(API_ENDPOINTS.DASHBOARD.RESUME, { params });
    return response.data;
  },

  async getInterviewDashboard(params = {}) {
    const response = await api.get(API_ENDPOINTS.DASHBOARD.INTERVIEWS, { params });
    return response.data;
  },

  async getApplicationDashboard(params = {}) {
    const response = await api.get(API_ENDPOINTS.DASHBOARD.APPLICATIONS, { params });
    return response.data;
  },

  async getCareerReadinessDashboard(params = {}) {
    const response = await api.get(API_ENDPOINTS.DASHBOARD.CAREER_READINESS, { params });
    return response.data;
  },

  async getActivityStream(params = {}) {
    const response = await api.get(API_ENDPOINTS.DASHBOARD.ACTIVITY, { params });
    return response.data;
  },
};

export default dashboardService;
