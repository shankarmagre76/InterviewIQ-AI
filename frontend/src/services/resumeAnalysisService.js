import { api } from './api';
import { API_ENDPOINTS } from '../constants/appConstants';

export const resumeAnalysisService = {
  async analyzeResume(data = {}) {
    const response = await api.post(API_ENDPOINTS.RESUME.ANALYZE, data);
    return response.data;
  },

  async getLatestAnalysis() {
    const response = await api.get(API_ENDPOINTS.RESUME.ANALYSIS_LATEST);
    return response.data;
  },

  async getAnalysisHistory() {
    const response = await api.get(API_ENDPOINTS.RESUME.ANALYSIS_HISTORY);
    return response.data;
  },

  async getAnalysisById(id) {
    const response = await api.get(API_ENDPOINTS.RESUME.ANALYSIS_BY_ID(id));
    return response.data;
  },

  async deleteAnalysis(id) {
    const response = await api.delete(API_ENDPOINTS.RESUME.ANALYSIS_BY_ID(id));
    return response.data;
  },
};

export default resumeAnalysisService;
