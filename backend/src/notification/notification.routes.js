import { Router } from 'express';
import authenticate from '../middleware/auth.middleware.js';
import {
  getNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from './notification.controller.js';
import {
  notificationIdParamValidation,
  notificationQueryValidation,
} from './notification.validation.js';

const router = Router();

// Protect all Notification routes with JWT Authentication
router.use(authenticate);

// GET /api/v1/notifications - Retrieve candidate notifications (Paginated)
router.get('/', notificationQueryValidation, getNotifications);

// GET /api/v1/notifications/unread - Retrieve candidate unread notifications
router.get('/unread', notificationQueryValidation, getUnreadNotifications);

// PATCH /api/v1/notifications/read-all - Bulk mark all unread notifications as read
router.patch('/read-all', markAllAsRead);

// PATCH /api/v1/notifications/:id/read - Mark single notification as read
router.patch('/:id/read', notificationIdParamValidation, markAsRead);

// DELETE /api/v1/notifications/:id - Delete notification
router.delete('/:id', notificationIdParamValidation, deleteNotification);

export default router;
