import { api } from './api';
import { API_ENDPOINTS } from '../constants/appConstants';

export const resumeService = {
  async uploadResume(formData) {
    const response = await api.post(API_ENDPOINTS.RESUME.BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getResume() {
    const response = await api.get(API_ENDPOINTS.RESUME.BASE);
    return response.data;
  },

  async getResumeHistory() {
    const response = await api.get(API_ENDPOINTS.RESUME.HISTORY);
    return response.data;
  },

  async getResumeById(id) {
    const response = await api.get(API_ENDPOINTS.RESUME.BY_ID(id));
    return response.data;
  },

  async updateResume(formData) {
    const response = await api.put(API_ENDPOINTS.RESUME.BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async updateResumeById(id, metadata) {
    const response = await api.put(API_ENDPOINTS.RESUME.BY_ID(id), metadata);
    return response.data;
  },

  async deleteResume() {
    const response = await api.delete(API_ENDPOINTS.RESUME.BASE);
    return response.data;
  },

  async deleteResumeById(id) {
    const response = await api.delete(API_ENDPOINTS.RESUME.BY_ID(id));
    return response.data;
  },
};

export default resumeService;
