import { api } from './api';
import { API_ENDPOINTS } from '../constants/appConstants';

export const applicationService = {
  async applyJob(applicationData) {
    const response = await api.post(API_ENDPOINTS.APPLICATION.BASE, applicationData);
    return response.data;
  },

  async getCandidateApplications(params = {}) {
    const response = await api.get(API_ENDPOINTS.APPLICATION.ME, { params });
    return response.data;
  },

  async getApplicationDetails(id) {
    const response = await api.get(API_ENDPOINTS.APPLICATION.BY_ID(id));
    return response.data;
  },

  async updateApplicationStatus(id, statusData) {
    const response = await api.patch(API_ENDPOINTS.APPLICATION.STATUS(id), statusData);
    return response.data;
  },
};

export default applicationService;
