import { api } from './api';
import { API_ENDPOINTS } from '../constants/appConstants';

/**
 * Authentication Service Module for InterviewIQ AI
 * Interfaces with backend Express v1 auth endpoints under /api/v1/auth/*
 */
export const authService = {
  /**
   * Register a new candidate or recruiter account
   * @param {object} userData - { firstName, lastName, email, password, role?, phone? }
   */
  async register(userData) {
    const payload = { ...userData };
    if (!payload.firstName && payload.name) {
      const parts = payload.name.trim().split(/\s+/);
      payload.firstName = parts[0] || '';
      payload.lastName = parts.slice(1).join(' ') || '';
    }
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, payload);
    return response.data;
  },

  /**
   * Authenticate user credentials and receive JWT access & refresh tokens
   * @param {object} credentials - { email, password }
   */
  async login(credentials) {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  /**
   * Log out active user and clear session on backend
   */
  async logout() {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  },

  /**
   * Fetch currently authenticated user profile details
   */
  async getCurrentUser() {
    const response = await api.get(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },

  /**
   * Generate new access & refresh tokens using an active refresh token
   * @param {string|object} tokenData - refreshToken string or { refreshToken } object
   */
  async refreshToken(tokenData) {
    const payload = typeof tokenData === 'string' ? { refreshToken: tokenData } : tokenData;
    const response = await api.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, payload);
    return response.data;
  },

  /**
   * Initiate password reset request via email
   * @param {string|object} emailData - email string or { email } object
   */
  async forgotPassword(emailData) {
    const payload = typeof emailData === 'string' ? { email: emailData } : emailData;
    const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, payload);
    return response.data;
  },

  /**
   * Reset user password using token
   * @param {string|object} tokenOrData - token string or { token, newPassword } object
   * @param {string} [newPassword] - new password if token is passed as first argument
   */
  async resetPassword(tokenOrData, newPassword) {
    let payload;
    if (typeof tokenOrData === 'object' && tokenOrData !== null) {
      payload = tokenOrData;
    } else {
      payload = { token: tokenOrData, newPassword };
    }
    const response = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, payload);
    return response.data;
  },

  /**
   * Verify email address via verification token
   * @param {string} token
   */
  async verifyEmail(token) {
    const response = await api.get(API_ENDPOINTS.AUTH.VERIFY_EMAIL(token));
    return response.data;
  },
};

export default authService;
