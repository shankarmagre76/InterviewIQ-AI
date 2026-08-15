import { api } from './api.js';
import { API_ENDPOINTS } from '../constants/appConstants.js';

/**
 * Resume Management Service Module for InterviewIQ AI
 * Provides API interaction methods for PDF resume uploads, replacements, downloads, and history.
 */
export const resumeService = {
  /**
   * Upload a new PDF resume document or replace active resume
   * POST /api/v1/profile/resume
   * @param {File|FormData} fileOrFormData - PDF File instance or FormData object
   * @returns {Promise<Object>} ApiResponse containing resume document details
   */
  async uploadResume(fileOrFormData) {
    let payload = fileOrFormData;

    // If a raw File object is passed, construct FormData with key 'resume'
    if (fileOrFormData instanceof File) {
      payload = new FormData();
      payload.append('resume', fileOrFormData);
    }

    const response = await api.post(API_ENDPOINTS.RESUME.BASE, payload);
    return response.data;
  },

  /**
   * Fetch candidate's active PDF resume details
   * GET /api/v1/profile/resume
   * @returns {Promise<Object>} ApiResponse containing active resume document
   */
  async getResume() {
    const response = await api.get(API_ENDPOINTS.RESUME.BASE);
    return response.data;
  },

  /**
   * Fetch complete resume upload history for candidate
   * GET /api/v1/profile/resume/history
   * @returns {Promise<Object>} ApiResponse containing array of uploaded resumes
   */
  async getResumeHistory() {
    const response = await api.get(API_ENDPOINTS.RESUME.HISTORY);
    return response.data;
  },

  /**
   * Fetch specific resume document by ID
   * GET /api/v1/profile/resume/:id
   * @param {string} id - Resume MongoDB ObjectId
   * @returns {Promise<Object>} ApiResponse containing resume document details
   */
  async getResumeDetails(id) {
    const response = await api.get(API_ENDPOINTS.RESUME.BY_ID(id));
    return response.data;
  },

  /**
   * Replace active resume document or update active resume metadata
   * PUT /api/v1/profile/resume
   * @param {File|FormData|Object} fileOrMetadata - Replacement PDF file, FormData, or metadata object
   * @returns {Promise<Object>} ApiResponse containing updated resume details
   */
  async updateResume(fileOrMetadata) {
    let payload = fileOrMetadata;

    if (fileOrMetadata instanceof File) {
      payload = new FormData();
      payload.append('resume', fileOrMetadata);
    }

    const response = await api.put(API_ENDPOINTS.RESUME.BASE, payload);
    return response.data;
  },

  /**
   * Update specific resume metadata by ID
   * PUT /api/v1/profile/resume/:id
   * @param {string} id - Resume MongoDB ObjectId
   * @param {Object} metadata - { originalName?: string }
   * @returns {Promise<Object>} ApiResponse containing updated resume details
   */
  async updateResumeById(id, metadata) {
    const response = await api.put(API_ENDPOINTS.RESUME.BY_ID(id), metadata);
    return response.data;
  },

  /**
   * Delete active resume document from Cloudinary storage and database
   * DELETE /api/v1/profile/resume
   * @returns {Promise<Object>} ApiResponse confirming deletion
   */
  async deleteResume() {
    const response = await api.delete(API_ENDPOINTS.RESUME.BASE);
    return response.data;
  },

  /**
   * Delete specific resume document by ID
   * DELETE /api/v1/profile/resume/:id
   * @param {string} id - Resume MongoDB ObjectId
   * @returns {Promise<Object>} ApiResponse confirming deletion
   */
  async deleteResumeById(id) {
    const response = await api.delete(API_ENDPOINTS.RESUME.BY_ID(id));
    return response.data;
  },

  /**
   * Helper to derive secure view / download URL for resume PDF
   * @param {Object} resume - Resume object from API
   * @returns {string} Public URL of PDF document
   */
  getResumeDownloadUrl(resume) {
    if (!resume) return '';
    return resume.url || resume.fileUrl || resume.resumeUrl || '';
  },
};

export default resumeService;
