import mongoose from 'mongoose';
import Notification from './notification.model.js';

/**
 * Notification Repository Layer
 * Handles pure MongoDB queries for Notification documents.
 * Contains ZERO business logic.
 */
class NotificationRepository {
  /**
   * Helper to safely cast string ID to Mongoose ObjectId
   */
  toObjectId(id) {
    if (!id) return null;
    if (id instanceof mongoose.Types.ObjectId) return id;
    if (mongoose.Types.ObjectId.isValid(id)) return new mongoose.Types.ObjectId(id);
    return id;
  }

  /**
   * 1. Create a single notification document in MongoDB.
   * @param {Object} data
   * @returns {Promise<Object>} Created Notification document
   */
  async createNotification(data) {
    return await Notification.create(data);
  }

  /**
   * 2. Find notification by ID enforcing candidate user ownership check.
   * @param {string|mongoose.Types.ObjectId} id
   * @param {string|mongoose.Types.ObjectId} userId
   * @returns {Promise<Object|null>} Notification document or null
   */
  async getNotificationById(id, userId) {
    return await Notification.findOne({
      _id: this.toObjectId(id),
      user: this.toObjectId(userId),
    });
  }

  /**
   * 3. Retrieve candidate notifications with pagination & filtering.
   * @param {string|mongoose.Types.ObjectId} userId
   * @param {Object} [options={}] - { page: 1, limit: 10, isRead: null, type: null }
   * @returns {Promise<Object>} Paginated notifications result
   */
  async getUserNotifications(userId, options = {}) {
    const { page = 1, limit = 10, isRead = null, type = null } = options;
    const skip = (Number(page) - 1) * Number(limit);

    const query = { user: this.toObjectId(userId) };
    if (isRead !== null && isRead !== undefined) {
      query.isRead = Boolean(isRead);
    }
    if (type) {
      query.type = type;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ user: this.toObjectId(userId), isRead: false }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    };
  }

  /**
   * 4. Count unread notifications for candidate.
   * @param {string|mongoose.Types.ObjectId} userId
   * @returns {Promise<number>} Unread count integer
   */
  async getUnreadCount(userId) {
    return await Notification.countDocuments({
      user: this.toObjectId(userId),
      isRead: false,
    });
  }

  /**
   * 5. Mark single notification as read.
   * @param {string|mongoose.Types.ObjectId} id
   * @param {string|mongoose.Types.ObjectId} userId
   * @returns {Promise<Object|null>} Updated Notification document
   */
  async markAsRead(id, userId) {
    return await Notification.findOneAndUpdate(
      { _id: this.toObjectId(id), user: this.toObjectId(userId) },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  /**
   * 6. Bulk mark all unread notifications for candidate as read.
   * @param {string|mongoose.Types.ObjectId} userId
   * @returns {Promise<Object>} MongoDB updateMany result
   */
  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { user: this.toObjectId(userId), isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  /**
   * 7. Delete single notification by ID.
   * @param {string|mongoose.Types.ObjectId} id
   * @param {string|mongoose.Types.ObjectId} userId
   * @returns {Promise<Object|null>} Deleted Notification document
   */
  async deleteNotification(id, userId) {
    return await Notification.findOneAndDelete({
      _id: this.toObjectId(id),
      user: this.toObjectId(userId),
    });
  }

  /**
   * 8. Check for duplicate notification created within a recent time window.
   * @param {Object} criteria - { user, type, relatedEntityId, minCreatedAt }
   * @returns {Promise<Object|null>} Matching notification or null
   */
  async findDuplicate(criteria) {
    const { user, type, relatedEntityId, minCreatedAt } = criteria;
    const query = {
      user: this.toObjectId(user),
      type,
      createdAt: { $gte: minCreatedAt },
    };
    if (relatedEntityId) {
      query.relatedEntityId = this.toObjectId(relatedEntityId);
    }
    return await Notification.findOne(query);
  }
}

export const notificationRepository = new NotificationRepository();
export default notificationRepository;
