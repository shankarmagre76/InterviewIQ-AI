import { api } from './api';
import { API_ENDPOINTS } from '../constants/appConstants';

export const companyService = {
  async listCompanies(params = {}) {
    const response = await api.get(API_ENDPOINTS.COMPANY.BASE, { params });
    return response.data;
  },

  async getCompanyById(id) {
    const response = await api.get(API_ENDPOINTS.COMPANY.BY_ID(id));
    return response.data;
  },

  async createCompany(companyData) {
    const response = await api.post(API_ENDPOINTS.COMPANY.BASE, companyData);
    return response.data;
  },

  async updateCompany(id, companyData) {
    const response = await api.put(API_ENDPOINTS.COMPANY.BY_ID(id), companyData);
    return response.data;
  },

  async deleteCompany(id) {
    const response = await api.delete(API_ENDPOINTS.COMPANY.BY_ID(id));
    return response.data;
  },
};

export default companyService;
