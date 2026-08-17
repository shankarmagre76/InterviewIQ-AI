import { api } from './api';
import { API_ENDPOINTS } from '../constants/appConstants';

/**
 * Candidate Dashboard Service for InterviewIQ AI
 * Interacts with backend endpoints under /api/v1/dashboard/*
 */
export const dashboardService = {
  /**
   * Main aggregated candidate dashboard summary
   * GET /api/v1/dashboard
   * @param {Object} [params]
   * @returns {Promise<Object>} Backend API response object containing profile, resume, interview, application stats, career readiness, & activity
   */
  async getDashboard(params = {}) {
    const response = await api.get(API_ENDPOINTS.DASHBOARD.BASE, { params });
    return response.data;
  },

  /**
   * Detailed candidate resume metrics, ATS score breakdown, & time-series history
   * GET /api/v1/dashboard/resume
   * @param {Object} [params]
   * @returns {Promise<Object>} Backend API response object
   */
  async getResumeAnalytics(params = {}) {
    const response = await api.get(API_ENDPOINTS.DASHBOARD.RESUME, { params });
    return response.data;
  },

  /**
   * Mock interview performance metrics, category scores & difficulty breakdown
   * GET /api/v1/dashboard/interviews
   * @param {Object} [params]
   * @returns {Promise<Object>} Backend API response object
   */
  async getInterviewAnalytics(params = {}) {
    const response = await api.get(API_ENDPOINTS.DASHBOARD.INTERVIEWS, { params });
    return response.data;
  },

  /**
   * Job application pipeline stats, status distribution & conversion rates
   * GET /api/v1/dashboard/applications
   * @param {Object} [params]
   * @returns {Promise<Object>} Backend API response object
   */
  async getApplicationAnalytics(params = {}) {
    const response = await api.get(API_ENDPOINTS.DASHBOARD.APPLICATIONS, { params });
    return response.data;
  },

  /**
   * Composite career readiness score evaluation & dynamic recommendation plan
   * GET /api/v1/dashboard/career-readiness
   * @param {Object} [params]
   * @returns {Promise<Object>} Backend API response object
   */
  async getCareerReadiness(params = {}) {
    const response = await api.get(API_ENDPOINTS.DASHBOARD.CAREER_READINESS, { params });
    return response.data;
  },

  /**
   * Paginated candidate activity feed stream
   * GET /api/v1/dashboard/activity
   * @param {Object} [params] - { page, limit, type }
   * @returns {Promise<Object>} Backend API response object
   */
  async getActivity(params = {}) {
    const response = await api.get(API_ENDPOINTS.DASHBOARD.ACTIVITY, { params });
    return response.data;
  },

  // Aliases for interface compliance and legacy callers
  async getMainDashboard(params = {}) {
    return this.getDashboard(params);
  },

  async getResumeDashboard(params = {}) {
    return this.getResumeAnalytics(params);
  },

  async getInterviewDashboard(params = {}) {
    return this.getInterviewAnalytics(params);
  },

  async getApplicationDashboard(params = {}) {
    return this.getApplicationAnalytics(params);
  },

  async getCareerReadinessDashboard(params = {}) {
    return this.getCareerReadiness(params);
  },

  async getActivityStream(params = {}) {
    return this.getActivity(params);
  },
};

export default dashboardService;

