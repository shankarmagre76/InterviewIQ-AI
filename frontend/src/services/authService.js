import { api } from './api';
import { API_ENDPOINTS } from '../constants/appConstants';

export const authService = {
  async register(userData) {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  },

  async login(credentials) {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  async refreshToken(tokenData) {
    const response = await api.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, tokenData);
    return response.data;
  },

  async forgotPassword(emailData) {
    const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, emailData);
    return response.data;
  },

  async resetPassword(resetData) {
    const response = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, resetData);
    return response.data;
  },

  async verifyEmail(token) {
    const response = await api.get(API_ENDPOINTS.AUTH.VERIFY_EMAIL(token));
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },

  async logout() {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  },
};

export default authService;
