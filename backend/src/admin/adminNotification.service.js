import notificationRepository from '../notification/notification.repository.js';
import Notification from '../notification/notification.model.js';
import User from '../models/User.js';
import adminAuditLogService from './adminAuditLog.service.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import mongoose from 'mongoose';

/**
 * Admin Notification Service Layer
 * Handles administrative system-wide announcement broadcasts, anti-duplicate checks,
 * audience resolution (ALL, USERS, ROLE), and audit logging.
 */
class AdminNotificationService {
  /**
   * 1. Send system-wide announcement broadcast.
   *
   * @param {Object} data - { title, message, type, priority, audience, userIds, targetRole }
   * @param {Object} adminUser - Authenticated admin user
   * @returns {Promise<Object>} Broadcast summary object
   */
  async sendAnnouncement(data = {}, adminUser) {
    const {
      title,
      message,
      type = 'SYSTEM',
      priority = 'HIGH',
      audience = 'ALL',
      userIds = [],
      targetRole = null,
      metadata = {},
    } = data;

    if (!title || !String(title).trim()) {
      throw ApiError.badRequest('Announcement title cannot be empty');
    }

    if (!message || !String(message).trim()) {
      throw ApiError.badRequest('Announcement message cannot be empty');
    }

    const adminId = adminUser._id || adminUser.id;

    // Anti-Duplicate Broadcast Safeguard: Check if identical announcement title/message was sent in last 5 minutes
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existingDuplicate = await Notification.findOne({
      title: String(title).trim(),
      message: String(message).trim(),
      createdAt: { $gte: fiveMinsAgo },
    });

    if (existingDuplicate) {
      throw ApiError.badRequest('An identical announcement broadcast was already sent within the last 5 minutes');
    }

    // Resolve Target Users based on Audience Selection
    let targetUsers = [];

    if (audience === 'ALL') {
      targetUsers = await User.find({ isActive: true }).select('_id').lean();
    } else if (audience === 'ROLE') {
      if (!targetRole || !['Student', 'Recruiter', 'Admin'].includes(targetRole)) {
        throw ApiError.badRequest("targetRole must be 'Student', 'Recruiter', or 'Admin' when audience is 'ROLE'");
      }
      targetUsers = await User.find({ role: targetRole, isActive: true }).select('_id').lean();
    } else if (audience === 'USERS') {
      if (!Array.isArray(userIds) || userIds.length === 0) {
        throw ApiError.badRequest("userIds array must be provided when audience is 'USERS'");
      }
      const validIds = userIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
      targetUsers = await User.find({ _id: { $in: validIds }, isActive: true }).select('_id').lean();
    } else {
      throw ApiError.badRequest("Invalid audience selection. Allowed values: 'ALL', 'USERS', 'ROLE'");
    }

    if (targetUsers.length === 0) {
      throw ApiError.badRequest('No active target users found matching the specified audience criteria');
    }

    // Prepare Notification Documents for Bulk Insert
    const notificationDocs = targetUsers.map((u) => ({
      user: u._id,
      type: type || 'SYSTEM',
      title: String(title).trim(),
      message: String(message).trim(),
      priority: priority || 'HIGH',
      isRead: false,
      metadata: {
        ...metadata,
        broadcastByAdmin: adminId,
        audience,
        targetRole: audience === 'ROLE' ? targetRole : null,
      },
    }));

    await Notification.insertMany(notificationDocs);

    logger.info(
      `Admin (${adminId}) broadcasted in-app announcement '${title}' to ${targetUsers.length} users (Audience: ${audience})`
    );

    // Non-blocking Audit Logging
    adminAuditLogService.logAction({
      admin: adminId,
      action: 'SEND_NOTIFICATION',
      targetType: 'Notification',
      description: `Admin broadcasted announcement '${title}' to ${targetUsers.length} users (${audience})`,
      metadata: { title, type, priority, audience, recipientCount: targetUsers.length },
    });

    return {
      broadcastId: new mongoose.Types.ObjectId().toString(),
      audience,
      recipientCount: targetUsers.length,
      title: String(title).trim(),
      type,
      priority,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 2. List sent notifications with filtering and pagination.
   *
   * @param {Object} queryParams - { page, limit, type, priority, isRead, user, dateFrom, dateTo }
   * @returns {Promise<Object>} Paginated notifications payload
   */
  async listSentNotifications(queryParams = {}) {
    const {
      page = 1,
      limit = 10,
      type = null,
      priority = null,
      isRead = null,
      user = null,
      dateFrom = null,
      dateTo = null,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryParams;

    const filter = {};

    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (isRead !== null && isRead !== undefined) filter.isRead = isRead === 'true' || isRead === true;
    if (user && mongoose.Types.ObjectId.isValid(user)) filter.user = new mongoose.Types.ObjectId(user);

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;
    const sort = { [sortBy]: String(sortOrder).toLowerCase() === 'asc' ? 1 : -1 };

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate('user', 'firstName lastName email role')
        .lean(),
      Notification.countDocuments(filter),
    ]);

    return {
      notifications,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    };
  }

  /**
   * 3. Retrieve single notification details by ID.
   *
   * @param {string} notificationId
   * @returns {Promise<Object>} Notification document
   */
  async getNotificationById(notificationId) {
    const notif = await Notification.findById(notificationId)
      .populate('user', 'firstName lastName email role')
      .lean();

    if (!notif) {
      throw ApiError.notFound('Notification record not found');
    }
    return notif;
  }

  /**
   * 4. Delete/cancel a single notification record safely.
   *
   * @param {string} notificationId
   * @returns {Promise<Object>} Confirmation payload
   */
  async deleteNotification(notificationId) {
    const existing = await Notification.findById(notificationId);
    if (!existing) {
      throw ApiError.notFound('Notification record not found');
    }

    await Notification.findByIdAndDelete(notificationId);

    return {
      message: 'Notification record deleted successfully',
      deletedNotificationId: notificationId,
    };
  }
}

export const adminNotificationService = new AdminNotificationService();
export default adminNotificationService;
