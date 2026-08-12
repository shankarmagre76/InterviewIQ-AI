import { api } from './api';
import { API_ENDPOINTS } from '../constants/appConstants';

export const jobService = {
  async searchJobs(params = {}) {
    const response = await api.get(API_ENDPOINTS.JOB.BASE, { params });
    return response.data;
  },

  async getJobDetails(id) {
    const response = await api.get(API_ENDPOINTS.JOB.BY_ID(id));
    return response.data;
  },

  async createJob(jobData) {
    const response = await api.post(API_ENDPOINTS.JOB.BASE, jobData);
    return response.data;
  },

  async updateJob(id, jobData) {
    const response = await api.put(API_ENDPOINTS.JOB.BY_ID(id), jobData);
    return response.data;
  },

  async deleteJob(id) {
    const response = await api.delete(API_ENDPOINTS.JOB.BY_ID(id));
    return response.data;
  },

  async getJobApplications(jobId, params = {}) {
    const response = await api.get(API_ENDPOINTS.JOB.APPLICATIONS(jobId), { params });
    return response.data;
  },
};

export default jobService;
