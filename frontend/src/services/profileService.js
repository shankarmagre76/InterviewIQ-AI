import { api } from './api';
import { API_ENDPOINTS } from '../constants/appConstants';

/**
 * Profile API Service Module for InterviewIQ AI
 * Interfaces with backend Express v1 profile endpoints under /api/v1/profile/*
 */
export const profileService = {
  /**
   * Fetch logged-in user's profile with populated user details
   * GET /api/v1/profile
   * @returns {Promise<Object>} ApiResponse: { success, statusCode, message, data: profileObject }
   */
  async getProfile() {
    const response = await api.get(API_ENDPOINTS.PROFILE.BASE);
    return response.data;
  },

  /**
   * Update logged-in user's profile basic details
   * PUT /api/v1/profile
   * @param {Object} profileData - { firstName, lastName, phone, gender, dateOfBirth, headline, bio, website, currentLocation, preferredLocation }
   * @returns {Promise<Object>} ApiResponse with updated profile
   */
  async updateProfile(profileData) {
    const response = await api.put(API_ENDPOINTS.PROFILE.BASE, profileData);
    return response.data;
  },

  /**
   * Upload & replace logged-in user's profile avatar image on Cloudinary
   * POST /api/v1/profile/image
   * @param {File|FormData} fileOrFormData - File object or pre-constructed FormData with 'profileImage' field
   * @returns {Promise<Object>} ApiResponse with updated profile containing new profileImage URL
   */
  async uploadAvatar(fileOrFormData) {
    let payload = fileOrFormData;
    if (typeof window !== 'undefined' && (fileOrFormData instanceof File || fileOrFormData instanceof Blob)) {
      payload = new FormData();
      payload.append('profileImage', fileOrFormData);
    }
    const response = await api.post(API_ENDPOINTS.PROFILE.IMAGE, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Calculate & return profile completion percentage breakdown
   * GET /api/v1/profile/completion
   * @returns {Promise<Object>} ApiResponse: { success, statusCode, message, data: { completion: number } }
   */
  async getCompletion() {
    const response = await api.get(API_ENDPOINTS.PROFILE.COMPLETION);
    return response.data;
  },

  /* ==========================================================================
     Skills Sub-resource API Methods
     ========================================================================== */

  /**
   * Get all skills of logged-in user profile
   * GET /api/v1/profile/skills
   * @returns {Promise<Object>} ApiResponse with skills array
   */
  async getSkills() {
    const response = await api.get(API_ENDPOINTS.PROFILE.SKILLS);
    return response.data;
  },

  /**
   * Add a new skill to user profile
   * POST /api/v1/profile/skills
   * @param {Object} skillData - { name: string, level?: 'Beginner' | 'Intermediate' | 'Advanced' }
   * @returns {Promise<Object>} ApiResponse with updated skills array
   */
  async addSkill(skillData) {
    const response = await api.post(API_ENDPOINTS.PROFILE.SKILLS, skillData);
    return response.data;
  },

  /**
   * Update an existing skill in user profile by skill ID
   * PUT /api/v1/profile/skills/:id
   * @param {string} id - Skill MongoDB ObjectId
   * @param {Object} skillData - { name?: string, level?: 'Beginner' | 'Intermediate' | 'Advanced' }
   * @returns {Promise<Object>} ApiResponse with updated skill subdocument
   */
  async updateSkill(id, skillData) {
    const response = await api.put(API_ENDPOINTS.PROFILE.SKILL_BY_ID(id), skillData);
    return response.data;
  },

  /**
   * Delete a skill from user profile by skill ID
   * DELETE /api/v1/profile/skills/:id
   * @param {string} id - Skill MongoDB ObjectId
   * @returns {Promise<Object>} ApiResponse with null data
   */
  async deleteSkill(id) {
    const response = await api.delete(API_ENDPOINTS.PROFILE.SKILL_BY_ID(id));
    return response.data;
  },

  /* ==========================================================================
     Education Sub-resource API Methods
     ========================================================================== */

  /**
   * Get all education records of logged-in user profile
   * GET /api/v1/profile/education
   * @returns {Promise<Object>} ApiResponse with education array
   */
  async getEducation() {
    const response = await api.get(API_ENDPOINTS.PROFILE.EDUCATION);
    return response.data;
  },

  /**
   * Add a new education record to user profile
   * POST /api/v1/profile/education
   * @param {Object} eduData - { institute: string, degree: string, branch?: string, cgpa?: number, startYear: number, endYear?: number, current?: boolean }
   * @returns {Promise<Object>} ApiResponse with updated education array
   */
  async addEducation(eduData) {
    const response = await api.post(API_ENDPOINTS.PROFILE.EDUCATION, eduData);
    return response.data;
  },

  /**
   * Update an existing education record in user profile by education ID
   * PUT /api/v1/profile/education/:id
   * @param {string} id - Education MongoDB ObjectId
   * @param {Object} eduData - { institute?: string, degree?: string, branch?: string, cgpa?: number, startYear?: number, endYear?: number, current?: boolean }
   * @returns {Promise<Object>} ApiResponse with updated education subdocument
   */
  async updateEducation(id, eduData) {
    const response = await api.put(API_ENDPOINTS.PROFILE.EDUCATION_BY_ID(id), eduData);
    return response.data;
  },

  /**
   * Delete an education record from user profile by education ID
   * DELETE /api/v1/profile/education/:id
   * @param {string} id - Education MongoDB ObjectId
   * @returns {Promise<Object>} ApiResponse with null data
   */
  async deleteEducation(id) {
    const response = await api.delete(API_ENDPOINTS.PROFILE.EDUCATION_BY_ID(id));
    return response.data;
  },

  /* ==========================================================================
     Experience Sub-resource API Methods
     ========================================================================== */

  /**
   * Get all experience records of logged-in user profile
   * GET /api/v1/profile/experience
   * @returns {Promise<Object>} ApiResponse with experience array
   */
  async getExperience() {
    const response = await api.get(API_ENDPOINTS.PROFILE.EXPERIENCE);
    return response.data;
  },

  /**
   * Add a new experience record to user profile
   * POST /api/v1/profile/experience
   * @param {Object} expData - { company: string, position: string, employmentType?: string, location?: string, startDate: string, endDate?: string, current?: boolean, description?: string }
   * @returns {Promise<Object>} ApiResponse with updated experience array
   */
  async addExperience(expData) {
    const response = await api.post(API_ENDPOINTS.PROFILE.EXPERIENCE, expData);
    return response.data;
  },

  /**
   * Update an existing experience record in user profile by experience ID
   * PUT /api/v1/profile/experience/:id
   * @param {string} id - Experience MongoDB ObjectId
   * @param {Object} expData - { company?: string, position?: string, employmentType?: string, location?: string, startDate?: string, endDate?: string, current?: boolean, description?: string }
   * @returns {Promise<Object>} ApiResponse with updated experience subdocument
   */
  async updateExperience(id, expData) {
    const response = await api.put(API_ENDPOINTS.PROFILE.EXPERIENCE_BY_ID(id), expData);
    return response.data;
  },

  /**
   * Delete an experience record from user profile by experience ID
   * DELETE /api/v1/profile/experience/:id
   * @param {string} id - Experience MongoDB ObjectId
   * @returns {Promise<Object>} ApiResponse with null data
   */
  async deleteExperience(id) {
    const response = await api.delete(API_ENDPOINTS.PROFILE.EXPERIENCE_BY_ID(id));
    return response.data;
  },

  /* ==========================================================================
     Projects Sub-resource API Methods
     ========================================================================== */

  /**
   * Get all project records of logged-in user profile
   * GET /api/v1/profile/projects
   * @returns {Promise<Object>} ApiResponse with projects array
   */
  async getProjects() {
    const response = await api.get(API_ENDPOINTS.PROFILE.PROJECTS);
    return response.data;
  },

  /**
   * Add a new project record to user profile
   * POST /api/v1/profile/projects
   * @param {Object} projectData - { title, description?, technologies?, role?, startDate?, endDate?, current?, githubUrl?, liveUrl?, projectType? }
   * @returns {Promise<Object>} ApiResponse with updated projects array
   */
  async addProject(projectData) {
    const response = await api.post(API_ENDPOINTS.PROFILE.PROJECTS, projectData);
    return response.data;
  },

  /**
   * Update an existing project record in user profile by project ID
   * PUT /api/v1/profile/projects/:id
   * @param {string} id - Project MongoDB ObjectId
   * @param {Object} projectData
   * @returns {Promise<Object>} ApiResponse with updated project subdocument
   */
  async updateProject(id, projectData) {
    const response = await api.put(API_ENDPOINTS.PROFILE.PROJECT_BY_ID(id), projectData);
    return response.data;
  },

  /**
   * Delete a project record from user profile by project ID
   * DELETE /api/v1/profile/projects/:id
   * @param {string} id - Project MongoDB ObjectId
   * @returns {Promise<Object>} ApiResponse with null data
   */
  async deleteProject(id) {
    const response = await api.delete(API_ENDPOINTS.PROFILE.PROJECT_BY_ID(id));
    return response.data;
  },

  /* ==========================================================================
     Certifications Sub-resource API Methods
     ========================================================================== */

  /**
   * Get all certification records of logged-in user profile
   * GET /api/v1/profile/certifications
   * @returns {Promise<Object>} ApiResponse with certifications array
   */
  async getCertifications() {
    const response = await api.get(API_ENDPOINTS.PROFILE.CERTIFICATIONS);
    return response.data;
  },

  /**
   * Add a new certification record to user profile
   * POST /api/v1/profile/certifications
   * @param {Object} certData - { title, issuingOrganization, issueDate?, expiryDate?, doesNotExpire?, credentialId?, credentialUrl? }
   * @returns {Promise<Object>} ApiResponse with updated certifications array
   */
  async addCertification(certData) {
    const response = await api.post(API_ENDPOINTS.PROFILE.CERTIFICATIONS, certData);
    return response.data;
  },

  /**
   * Update an existing certification record in user profile by certification ID
   * PUT /api/v1/profile/certifications/:id
   * @param {string} id - Certification MongoDB ObjectId
   * @param {Object} certData
   * @returns {Promise<Object>} ApiResponse with updated certification subdocument
   */
  async updateCertification(id, certData) {
    const response = await api.put(API_ENDPOINTS.PROFILE.CERTIFICATION_BY_ID(id), certData);
    return response.data;
  },

  /**
   * Delete a certification record from user profile by certification ID
   * DELETE /api/v1/profile/certifications/:id
   * @param {string} id - Certification MongoDB ObjectId
   * @returns {Promise<Object>} ApiResponse with null data
   */
  async deleteCertification(id) {
    const response = await api.delete(API_ENDPOINTS.PROFILE.CERTIFICATION_BY_ID(id));
    return response.data;
  },

  /* ==========================================================================
     Social Links API Methods
     ========================================================================== */

  /**
   * Get social links of logged-in user profile
   * GET /api/v1/profile/social-links
   * @returns {Promise<Object>} ApiResponse with social links object
   */
  async getSocialLinks() {
    const response = await api.get(API_ENDPOINTS.PROFILE.SOCIAL_LINKS);
    return response.data;
  },

  /**
   * Update social links of logged-in user profile
   * PUT /api/v1/profile/social-links
   * @param {Object} socialData - { github?: string, linkedin?: string, portfolio?: string, leetcode?: string, hackerrank?: string, codechef?: string }
   * @returns {Promise<Object>} ApiResponse with updated social links object
   */
  async updateSocialLinks(socialData) {
    const response = await api.put(API_ENDPOINTS.PROFILE.SOCIAL_LINKS, socialData);
    return response.data;
  },

  /* ==========================================================================
     Resume API Methods
     ========================================================================== */

  /**
   * Get resume details of logged-in user profile
   * GET /api/v1/profile/resume
   * @returns {Promise<Object>} ApiResponse with resume subdocument metadata
   */
  async getResume() {
    const response = await api.get(API_ENDPOINTS.PROFILE.RESUME);
    return response.data;
  },

  /**
   * Upload resume document (PDF, DOC, DOCX) to Cloudinary and update profile
   * POST /api/v1/profile/resume
   * @param {File|FormData} fileOrFormData - File object or pre-constructed FormData with 'resume' field
   * @returns {Promise<Object>} ApiResponse with resume subdocument metadata
   */
  async uploadResume(fileOrFormData) {
    let payload = fileOrFormData;
    if (typeof window !== 'undefined' && (fileOrFormData instanceof File || fileOrFormData instanceof Blob)) {
      payload = new FormData();
      payload.append('resume', fileOrFormData);
    }
    const response = await api.post(API_ENDPOINTS.PROFILE.RESUME, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Update resume details of logged-in user profile
   * PUT /api/v1/profile/resume
   * @param {Object} resumeData - { url?: string, publicId?: string, uploadedDate?: string }
   * @returns {Promise<Object>} ApiResponse with updated resume subdocument metadata
   */
  async updateResume(resumeData) {
    const response = await api.put(API_ENDPOINTS.PROFILE.RESUME, resumeData);
    return response.data;
  },

  /**
   * Delete resume document from Cloudinary and reset profile resume details
   * DELETE /api/v1/profile/resume
   * @returns {Promise<Object>} ApiResponse with null data
   */
  async deleteResume() {
    const response = await api.delete(API_ENDPOINTS.PROFILE.RESUME);
    return response.data;
  },

  /* ==========================================================================
     Profile Deletion API Method
     ========================================================================== */

  /**
   * Delete logged-in user's profile and avatar image
   * DELETE /api/v1/profile
   * @returns {Promise<Object>} ApiResponse with null data
   */
  async deleteProfile() {
    const response = await api.delete(API_ENDPOINTS.PROFILE.BASE);
    return response.data;
  },
};

export default profileService;
