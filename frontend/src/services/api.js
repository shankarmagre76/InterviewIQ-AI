import axios from 'axios';
import { storage } from '../utils/helpers';
import { env } from '../config/env';

const API_BASE_URL = env.API_BASE_URL;


/**
 * Centralized Axios Instance for InterviewIQ AI
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * Request Interceptor: Attach Bearer Access Token
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
 * Response Interceptor: Auto Refresh Token on 401 & Prevent Infinite Loops
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && originalRequest) {
      // Prevent infinite retry loop
      if (originalRequest._retry) {
        clearAuthSession();
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      const refreshToken = storage.get('interviewiq_refresh_token');

      if (refreshToken) {
        try {
          // Attempt silent token refresh
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
          const resData = refreshResponse.data?.data || refreshResponse.data;

          const newAccessToken = resData?.accessToken;
          const newRefreshToken = resData?.refreshToken;

          if (newAccessToken) {
            storage.set('interviewiq_token', newAccessToken);
            if (newRefreshToken) {
              storage.set('interviewiq_refresh_token', newRefreshToken);
            }

            api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

            return api(originalRequest);
          }
        } catch {
          // Refresh failed -> clear session
          clearAuthSession();
          return Promise.reject(error);
        }
      }

      clearAuthSession();
    }

    return Promise.reject(error);
  }
);

function clearAuthSession() {
  storage.remove('interviewiq_token');
  storage.remove('interviewiq_refresh_token');
  storage.remove('interviewiq_user');

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('interviewiq:auth:unauthorized'));
  }
}

export default api;
