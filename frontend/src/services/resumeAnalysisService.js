import { api } from './api.js';
import { API_ENDPOINTS } from '../constants/appConstants.js';

/**
 * AI Resume Analysis Service Module for InterviewIQ AI
 * Provides API interaction methods for generating ATS resume analysis reports, fetching history, and report deletion.
 */
export const resumeAnalysisService = {
  /**
   * Initiate AI Resume Analysis for active or specified resume document
   * POST /api/v1/profile/resume/analyze
   * @param {Object} data - { resumeId?: string, targetRole?: string, experienceLevel?: string, provider?: string }
   * @returns {Promise<Object>} ApiResponse containing full AI Resume Analysis report
   */
  async analyzeResume(data = {}) {
    const response = await api.post(API_ENDPOINTS.RESUME.ANALYZE, data);
    return response.data;
  },

  /**
   * Fetch candidate's latest active resume analysis report
   * GET /api/v1/profile/resume/analysis/latest
   * @returns {Promise<Object>} ApiResponse containing latest analysis report
   */
  async getLatestAnalysis() {
    const response = await api.get(API_ENDPOINTS.RESUME.ANALYSIS_LATEST);
    return response.data;
  },

  /**
   * Fetch complete resume analysis report history for candidate
   * GET /api/v1/profile/resume/analysis/history
   * @returns {Promise<Object>} ApiResponse containing array of past analysis reports
   */
  async getAnalysisHistory() {
    const response = await api.get(API_ENDPOINTS.RESUME.ANALYSIS_HISTORY);
    return response.data;
  },

  /**
   * Fetch specific resume analysis report by ID
   * GET /api/v1/profile/resume/analysis/:id
   * @param {string} id - Analysis Report MongoDB ObjectId
   * @returns {Promise<Object>} ApiResponse containing specific analysis report
   */
  async getAnalysisById(id) {
    const response = await api.get(API_ENDPOINTS.RESUME.ANALYSIS_BY_ID(id));
    return response.data;
  },

  /**
   * Delete specific resume analysis report by ID
   * DELETE /api/v1/profile/resume/analysis/:id
   * @param {string} id - Analysis Report MongoDB ObjectId
   * @returns {Promise<Object>} ApiResponse confirming deletion
   */
  async deleteAnalysis(id) {
    const response = await api.delete(API_ENDPOINTS.RESUME.ANALYSIS_BY_ID(id));
    return response.data;
  },
};

export default resumeAnalysisService;
