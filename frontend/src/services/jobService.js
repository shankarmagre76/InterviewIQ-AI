import { api } from './api';
import { API_ENDPOINTS } from '../constants/appConstants';

/**
 * Job Service
 * Provides API interaction for searching, filtering, creating, updating, deleting, saving, and managing job applications.
 */
export const jobService = {
  /**
   * Search, filter, and paginate job listings.
   * @param {Object} [params={}] - Query params: keyword, search, company, companyName, workMode, employmentType, status, location, skills, minSalary, maxSalary, minExp, maxExp, page, limit, sort
   * @returns {Promise<Object>} API response payload { data: Array, total, page, totalPages }
   */
  async searchJobs(params = {}) {
    const response = await api.get(API_ENDPOINTS.JOB.BASE, { params });
    return response.data;
  },

  /**
   * Get jobs posted by the authenticated recruiter / company owner.
   * @param {Object} [params={}] - Pagination and filter parameters
   */
  async getMyJobs(params = {}) {
    const response = await api.get('/jobs/my-jobs', { params });
    return response.data;
  },

  /**
   * Alias for searchJobs to support listing calls.
   * @param {Object} [params={}] - Pagination and filter parameters
   */
  async listJobs(params = {}) {
    return this.searchJobs(params);
  },

  /**
   * Get detailed job posting by ID.
   * @param {string} id - Job ObjectId
   * @returns {Promise<Object>} API response payload with job details
   */
  async getJobDetails(id) {
    const response = await api.get(API_ENDPOINTS.JOB.BY_ID(id));
    return response.data;
  },

  /**
   * Alias for getJobDetails.
   * @param {string} id - Job ObjectId
   */
  async getJobById(id) {
    return this.getJobDetails(id);
  },

  /**
   * Create a new job posting (Recruiter / Admin only).
   * @param {Object} jobData - Job posting payload
   */
  async createJob(jobData) {
    const response = await api.post(API_ENDPOINTS.JOB.BASE, jobData);
    return response.data;
  },

  /**
   * Update an existing job posting (Job Owner / Admin only).
   * @param {string} id - Job ObjectId
   * @param {Object} jobData - Updated fields
   */
  async updateJob(id, jobData) {
    const response = await api.put(API_ENDPOINTS.JOB.BY_ID(id), jobData);
    return response.data;
  },

  /**
   * Delete a job posting (Job Owner / Admin only).
   * @param {string} id - Job ObjectId
   */
  async deleteJob(id) {
    const response = await api.delete(API_ENDPOINTS.JOB.BY_ID(id));
    return response.data;
  },

  /**
   * Fetch candidate applications submitted for a specific job listing (Recruiter / Admin only).
   * @param {string} jobId - Job ObjectId
   * @param {Object} [params={}] - Status, pagination, and sorting params
   */
  async getJobApplications(jobId, params = {}) {
    const response = await api.get(API_ENDPOINTS.JOB.APPLICATIONS(jobId), { params });
    return response.data;
  },

  /**
   * Bookmark / Save a job listing for the candidate user.
   * @param {string} jobId - Job ObjectId to save
   */
  async saveJob(jobId) {
    const response = await api.post(API_ENDPOINTS.SAVED_JOB.BASE, { job: jobId, jobId });
    return response.data;
  },

  /**
   * Remove a job bookmark / Unsave job.
   * @param {string} jobId - Job ObjectId to unsave
   */
  async unsaveJob(jobId) {
    const response = await api.delete(API_ENDPOINTS.SAVED_JOB.BY_ID(jobId));
    return response.data;
  },

  /**
   * Retrieve all saved job bookmarks for the candidate user.
   * @param {Object} [params={}] - Pagination parameters
   */
  async getSavedJobs(params = {}) {
    const response = await api.get(API_ENDPOINTS.SAVED_JOB.BASE, { params });
    return response.data;
  },

  /**
   * Check whether a specific job listing is bookmarked by current user.
   * @param {string} jobId - Job ObjectId to check
   */
  async checkIsJobSaved(jobId) {
    const response = await api.get(API_ENDPOINTS.SAVED_JOB.CHECK(jobId));
    return response.data;
  },
};

export default jobService;
