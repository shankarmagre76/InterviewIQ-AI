import asyncHandler from '../middleware/async.middleware.js';
import ApiResponse from '../utils/ApiResponse.js';
import adminNotificationService from './adminNotification.service.js';

/**
 * Admin Notification Controller Layer
 * Handles HTTP requests for administrative announcement broadcasts and notification management,
 * delegates to AdminNotificationService, and sends standardized HTTP responses via ApiResponse.
 * Contains ZERO business logic.
 */

/**
 * @desc    POST /api/v1/admin/notifications
 *          Broadcast system announcement in-app notifications (ALL, USERS, ROLE)
 * @access  Private (Admin Only)
 */
export const sendAnnouncement = asyncHandler(async (req, res) => {
  const adminUser = req.user;
  const result = await adminNotificationService.sendAnnouncement(req.body, adminUser);

  return new ApiResponse(
    201,
    result,
    `System announcement broadcasted successfully to ${result.recipientCount} active users`
  ).send(res);
});

/**
 * @desc    GET /api/v1/admin/notifications
 *          Retrieve paginated list of sent notifications
 * @access  Private (Admin Only)
 */
export const listSentNotifications = asyncHandler(async (req, res) => {
  const result = await adminNotificationService.listSentNotifications(req.query);

  return new ApiResponse(
    200,
    result.notifications,
    'Notifications list retrieved successfully',
    {
      total: result.total,
      page: result.page,
      limit: Number(req.query.limit || 10),
      totalPages: result.totalPages,
    }
  ).send(res);
});

/**
 * @desc    GET /api/v1/admin/notifications/:id
 *          Retrieve single notification document by ID
 * @access  Private (Admin Only)
 */
export const getNotificationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notif = await adminNotificationService.getNotificationById(id);

  return new ApiResponse(
    200,
    notif,
    'Notification record retrieved successfully'
  ).send(res);
});

/**
 * @desc    DELETE /api/v1/admin/notifications/:id
 *          Delete a single notification document
 * @access  Private (Admin Only)
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await adminNotificationService.deleteNotification(id);

  return new ApiResponse(
    200,
    result,
    'Notification record deleted successfully'
  ).send(res);
});
