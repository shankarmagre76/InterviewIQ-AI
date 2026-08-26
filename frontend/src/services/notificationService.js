import { api } from './api.js';
import { API_ENDPOINTS } from '../constants/appConstants.js';

/**
 * Supported Notification Types from Backend Model
 */
export const NOTIFICATION_TYPES = {
  LEARNING_TASK: 'LEARNING_TASK',
  ROADMAP_UPDATE: 'ROADMAP_UPDATE',
  ROADMAP_MILESTONE: 'ROADMAP_MILESTONE',
  INTERVIEW_RESULT: 'INTERVIEW_RESULT',
  INTERVIEW_REMINDER: 'INTERVIEW_REMINDER',
  RESUME_ANALYSIS: 'RESUME_ANALYSIS',
  RESUME_IMPROVEMENT: 'RESUME_IMPROVEMENT',
  APPLICATION_STATUS: 'APPLICATION_STATUS',
  APPLICATION_DEADLINE: 'APPLICATION_DEADLINE',
  SKILL_GAP: 'SKILL_GAP',
  SYSTEM: 'SYSTEM',
};

/**
 * Supported Notification Priority Levels from Backend Model
 */
export const NOTIFICATION_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
};

/**
 * Frontend Notification Service Layer
 * Wraps all candidate notification API calls supported by backend /api/v1/notifications/*
 */
export const notificationService = {
  /**
   * Retrieve candidate notifications (Paginated, optional filtering by type & isRead status)
   * GET /api/v1/notifications
   * 
   * @param {Object} [params]
   * @param {number} [params.page=1] - Page number (min: 1)
   * @param {number} [params.limit=10] - Items per page (min: 1, max: 100)
   * @param {string} [params.type] - Filter by notification type enum
   * @param {boolean} [params.isRead] - Filter by read status boolean
   * @returns {Promise<Object>} Standard ApiResponse { success, statusCode, message, data: { notifications, unreadCount, pagination } }
   */
  async getNotifications(params = {}) {
    const queryParams = {};
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.limit !== undefined) queryParams.limit = params.limit;
    if (params.type) queryParams.type = params.type;
    if (params.isRead !== undefined && params.isRead !== null) queryParams.isRead = params.isRead;

    const response = await api.get(API_ENDPOINTS.NOTIFICATION.BASE, { params: queryParams });
    return response.data;
  },

  /**
   * Retrieve candidate unread notifications & count (Paginated)
   * GET /api/v1/notifications/unread
   * 
   * @param {Object} [params]
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Limit per page
   * @returns {Promise<Object>} Standard ApiResponse { success, statusCode, message, data: { notifications, unreadCount, pagination } }
   */
  async getUnreadNotifications(params = {}) {
    const queryParams = {};
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.limit !== undefined) queryParams.limit = params.limit;

    const response = await api.get(API_ENDPOINTS.NOTIFICATION.UNREAD, { params: queryParams });
    return response.data;
  },

  /**
   * Helper method to fetch total unread notification count
   * Derived via GET /api/v1/notifications/unread?limit=1
   * 
   * @returns {Promise<Object>} Object containing unreadCount and full API response
   */
  async getUnreadCount() {
    const response = await api.get(API_ENDPOINTS.NOTIFICATION.UNREAD, { params: { limit: 1 } });
    const resData = response.data;
    const unreadCount = resData?.data?.unreadCount ?? 0;
    return {
      success: resData?.success ?? true,
      unreadCount,
      count: unreadCount,
      data: resData?.data,
    };
  },

  /**
   * Mark a single notification document as read
   * PATCH /api/v1/notifications/:id/read
   * 
   * @param {string} id - Notification MongoId
   * @returns {Promise<Object>} Standard ApiResponse with updated notification document in data
   */
  async markAsRead(id) {
    if (!id) {
      throw new Error('Notification ID is required for markAsRead');
    }
    const response = await api.patch(API_ENDPOINTS.NOTIFICATION.MARK_READ(id));
    return response.data;
  },

  /**
   * Bulk mark all candidate unread notifications as read
   * PATCH /api/v1/notifications/read-all
   * 
   * @returns {Promise<Object>} Standard ApiResponse with { message, modifiedCount } in data
   */
  async markAllAsRead() {
    const response = await api.patch(API_ENDPOINTS.NOTIFICATION.READ_ALL);
    return response.data;
  },

  /**
   * Delete a single notification document
   * DELETE /api/v1/notifications/:id
   * 
   * @param {string} id - Notification MongoId
   * @returns {Promise<Object>} Standard ApiResponse with { message, deletedId } in data
   */
  async deleteNotification(id) {
    if (!id) {
      throw new Error('Notification ID is required for deleteNotification');
    }
    const response = await api.delete(API_ENDPOINTS.NOTIFICATION.BY_ID(id));
    return response.data;
  },

  /* ==========================================================================
     UNSUPPORTED ENDPOINTS (Safeguard Stubs)
     ========================================================================== */

  /**
   * Mark notification as unread
   * UNSUPPORTED: Backend does not provide a route to mark notification as unread.
   */
  async markAsUnread() {
    throw new Error('Marking notification as unread is not supported by the backend API.');
  },

  /**
   * Notification Preferences (Get)
   * UNSUPPORTED: Backend candidate notification API does not support user notification preferences.
   */
  async getPreferences() {
    throw new Error('Notification preferences are not supported by the backend API.');
  },

  /**
   * Notification Preferences (Update)
   * UNSUPPORTED: Backend candidate notification API does not support user notification preferences.
   */
  async updatePreferences() {
    throw new Error('Notification preferences are not supported by the backend API.');
  },
};

export default notificationService;
