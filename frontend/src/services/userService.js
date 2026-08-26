import { api } from './api';
import { API_ENDPOINTS } from '../constants/appConstants';

export const userService = {
  async getProfile() {
    const response = await api.get(API_ENDPOINTS.USER.PROFILE);
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put(API_ENDPOINTS.USER.PROFILE, profileData);
    return response.data;
  },

  async changePassword(passwords) {
    const response = await api.put(API_ENDPOINTS.USER.PASSWORD, passwords);
    return response.data;
  },
};
