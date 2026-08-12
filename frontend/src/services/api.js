import axios from 'axios';
import { storage } from '../utils/helpers';

const DEFAULT_BASE_URL = '/api/v1';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;

/**
 * Centralized Axios API Client Instance
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * Request Interceptor: Inject Bearer JWT Token
 */
api.interceptors.request.use(
  (config) => {
    const token = storage.get('interviewiq_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor: Standardized Error Handling & 401 Session Handling
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (Token Expiration or Invalid Authentication)
    if (error.response && error.response.status === 401) {
      // Prevent infinite retry loops using _retry flag
      if (!originalRequest || originalRequest._retry) {
        storage.remove('interviewiq_token');
        storage.remove('interviewiq_user');
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // Clear session storage securely without logging sensitive tokens
      storage.remove('interviewiq_token');
      storage.remove('interviewiq_user');

      // Dispatch session expired custom event if window context exists
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('interviewiq:auth:unauthorized'));
      }
    }

    return Promise.reject(error);
  }
);

export default api;
