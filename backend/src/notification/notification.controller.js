import asyncHandler from '../middleware/async.middleware.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import notificationService from './notification.service.js';

/**
 * Notification Controller Layer
 * Handles HTTP requests for candidate notifications, delegates to NotificationService,
 * and sends standardized HTTP responses. Contains ZERO business logic.
 */

/**
 * @desc    GET /api/v1/notifications
 *          Retrieve candidate notifications (Paginated)
 * @access  Private (JWT Protected)
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User authentication required');
  }

  const { page = 1, limit = 10, type = null, isRead = null } = req.query;

  const result = await notificationService.getNotifications(userId, {
    page: Number(page),
    limit: Number(limit),
    type,
    isRead,
  });

  return new ApiResponse(
    200,
    result,
    'Notifications retrieved successfully'
  ).send(res);
});

/**
 * @desc    GET /api/v1/notifications/unread
 *          Retrieve candidate unread notifications & count
 * @access  Private (JWT Protected)
 */
export const getUnreadNotifications = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User authentication required');
  }

  const { page = 1, limit = 10 } = req.query;

  const result = await notificationService.getUnreadNotifications(userId, {
    page: Number(page),
    limit: Number(limit),
  });

  return new ApiResponse(
    200,
    result,
    'Unread notifications retrieved successfully'
  ).send(res);
});

/**
 * @desc    PATCH /api/v1/notifications/:id/read
 *          Mark a single notification as read
 * @access  Private (JWT Protected)
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User authentication required');
  }

  const { id } = req.params;
  const updatedNotif = await notificationService.markAsRead(id, userId);

  return new ApiResponse(
    200,
    updatedNotif,
    'Notification marked as read'
  ).send(res);
});

/**
 * @desc    PATCH /api/v1/notifications/read-all
 *          Bulk mark all candidate unread notifications as read
 * @access  Private (JWT Protected)
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User authentication required');
  }

  const result = await notificationService.markAllAsRead(userId);

  return new ApiResponse(
    200,
    result,
    'All notifications marked as read'
  ).send(res);
});

/**
 * @desc    DELETE /api/v1/notifications/:id
 *          Delete a notification document
 * @access  Private (JWT Protected)
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User authentication required');
  }

  const { id } = req.params;
  const result = await notificationService.deleteNotification(id, userId);

  return new ApiResponse(
    200,
    result,
    'Notification deleted successfully'
  ).send(res);
});
