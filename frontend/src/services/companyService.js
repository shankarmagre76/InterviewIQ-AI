import { api } from './api';
import { API_ENDPOINTS } from '../constants/appConstants';

/**
 * Company Service
 * Provides API interaction for listing, searching, creating, updating, and deleting companies.
 */
export const companyService = {
  /**
   * List companies with pagination and filter parameters.
   * @param {Object} [params={}] - { search, industry, hiringStatus, createdBy, page, limit, sort }
   * @returns {Promise<Object>} API response payload { data: Array, total, page, totalPages }
   */
  async listCompanies(params = {}) {
    const response = await api.get(API_ENDPOINTS.COMPANY.BASE, { params });
    return response.data;
  },

  /**
   * Get company profile of the authenticated recruiter user.
   * @returns {Promise<Object>} API response payload with company details or null
   */
  async getMyCompany() {
    const response = await api.get('/companies/my-company');
    return response.data;
  },

  /**
   * Get company profile details by ID.
   * @param {string} id - Company ID
   * @returns {Promise<Object>} API response payload with company details
   */
  async getCompanyById(id) {
    const response = await api.get(API_ENDPOINTS.COMPANY.BY_ID(id));
    return response.data;
  },

  /**
   * Alias for getCompanyById for consistency.
   * @param {string} id - Company ID
   */
  async getCompanyDetails(id) {
    return this.getCompanyById(id);
  },

  /**
   * Search companies by keyword query.
   * @param {string} query - Keyword search query
   * @param {Object} [extraParams={}] - Additional filter/pagination params
   */
  async searchCompanies(query, extraParams = {}) {
    return this.listCompanies({ search: query, ...extraParams });
  },

  /**
   * Fetch active job listings belonging to a specific company.
   * @param {string} companyId - Company ID
   * @param {Object} [params={}] - Filter and pagination options
   */
  async getCompanyJobs(companyId, params = {}) {
    const response = await api.get(API_ENDPOINTS.JOB.BASE, {
      params: { company: companyId, ...params },
    });
    return response.data;
  },

  /**
   * Create a new company profile (Recruiter / Admin only).
   * @param {Object} companyData - Company creation payload
   */
  async createCompany(companyData) {
    const response = await api.post(API_ENDPOINTS.COMPANY.BASE, companyData);
    return response.data;
  },

  /**
   * Update an existing company profile (Company Owner / Admin only).
   * @param {string} id - Company ID
   * @param {Object} companyData - Updated fields
   */
  async updateCompany(id, companyData) {
    const response = await api.put(API_ENDPOINTS.COMPANY.BY_ID(id), companyData);
    return response.data;
  },

  /**
   * Delete a company profile (Company Owner / Admin only).
   * @param {string} id - Company ID
   */
  async deleteCompany(id) {
    const response = await api.delete(API_ENDPOINTS.COMPANY.BY_ID(id));
    return response.data;
  },
};

export default companyService;
