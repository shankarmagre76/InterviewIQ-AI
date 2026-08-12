import { api } from './api';
import { API_ENDPOINTS } from '../constants/appConstants';

export const notificationService = {
  async getNotifications(params = {}) {
    const response = await api.get(API_ENDPOINTS.NOTIFICATION.BASE, { params });
    return response.data;
  },

  async getUnreadNotifications(params = {}) {
    const response = await api.get(API_ENDPOINTS.NOTIFICATION.UNREAD, { params });
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.patch(API_ENDPOINTS.NOTIFICATION.READ_ALL);
    return response.data;
  },

  async markAsRead(id) {
    const response = await api.patch(API_ENDPOINTS.NOTIFICATION.MARK_READ(id));
    return response.data;
  },

  async deleteNotification(id) {
    const response = await api.delete(API_ENDPOINTS.NOTIFICATION.BY_ID(id));
    return response.data;
  },
};

export default notificationService;
