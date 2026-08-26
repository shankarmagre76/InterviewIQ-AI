import { api } from './api';
import { API_ENDPOINTS } from '../constants/appConstants';

/**
 * Application Service
 * Provides API interaction for submitting job applications, viewing candidate application history,
 * inspecting application details, and updating status/interview details.
 */
export const applicationService = {
  /**
   * Submit a new job application (Student / Candidate only).
   * @param {Object} applicationData - { job, company, resume, coverLetter }
   * @returns {Promise<Object>} Created application payload
   */
  async applyJob(applicationData) {
    const response = await api.post(API_ENDPOINTS.APPLICATION.BASE, applicationData);
    return response.data;
  },

  /**
   * Fetch candidate's submitted job applications history.
   * @param {Object} [params={}] - { status, page, limit, sort }
   * @returns {Promise<Object>} API response payload { data: Array, total, page, totalPages }
   */
  async getCandidateApplications(params = {}) {
    const response = await api.get(API_ENDPOINTS.APPLICATION.ME, { params });
    return response.data;
  },

  /**
   * Alias for getCandidateApplications.
   * @param {Object} [params={}] - Pagination and filter parameters
   */
  async getMyApplications(params = {}) {
    return this.getCandidateApplications(params);
  },

  /**
   * Get single application details by ID (Applicant, Company Recruiter, or Admin).
   * @param {string} id - Application ObjectId
   * @returns {Promise<Object>} API response payload with populated application document
   */
  async getApplicationDetails(id) {
    const response = await api.get(API_ENDPOINTS.APPLICATION.BY_ID(id));
    return response.data;
  },

  /**
   * Alias for getApplicationDetails.
   * @param {string} id - Application ObjectId
   */
  async getApplicationById(id) {
    return this.getApplicationDetails(id);
  },

  /**
   * Update job application pipeline status, interview schedule, or notes/feedback (Recruiter / Admin only).
   * @param {string} id - Application ObjectId
   * @param {Object} statusData - { status, interviewDate, recruiterNotes, feedback }
   * @returns {Promise<Object>} API response payload with updated application document
   */
  async updateApplicationStatus(id, statusData) {
    const response = await api.patch(API_ENDPOINTS.APPLICATION.STATUS(id), statusData);
    return response.data;
  },
};

export default applicationService;
