import mongoose from 'mongoose';
import User from '../models/User.js';

/**
 * Admin User Repository Layer
 * Handles pure MongoDB / Mongoose query operations for user management.
 * Contains ZERO business logic. Excludes sensitive password & authentication tokens.
 */
class AdminUserRepository {
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
   * Excluded sensitive fields string for select operations
   */
  getSensitiveFieldsExclude() {
    return '-password -refreshToken -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire';
  }

  /**
   * 1. Retrieve paginated users matching search, role, status, and sort criteria.
   *
   * @param {Object} filter - MongoDB query filter object
   * @param {Object} options - { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: -1 }
   * @returns {Promise<Object>} { users: Array, pagination: Object }
   */
  async getUsers(filter = {}, options = {}) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1 } = options;
    const skip = (Number(page) - 1) * Number(limit);
    const sortObj = { [sortBy]: Number(sortOrder) };

    const [users, total] = await Promise.all([
      User.find(filter)
        .select(this.getSensitiveFieldsExclude())
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(filter),
    ]);

    return {
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) || 1,
        hasNextPage: Number(page) * Number(limit) < total,
        hasPrevPage: Number(page) > 1,
      },
    };
  }

  /**
   * 2. Find a user document by ID excluding sensitive fields.
   *
   * @param {string|mongoose.Types.ObjectId} userId
   * @returns {Promise<Object|null>} User document or null
   */
  async getUserById(userId) {
    return await User.findById(this.toObjectId(userId))
      .select(this.getSensitiveFieldsExclude())
      .lean();
  }

  /**
   * 3. Update an existing user document.
   *
   * @param {string|mongoose.Types.ObjectId} userId
   * @param {Object} updateData
   * @returns {Promise<Object|null>} Updated User document or null
   */
  async updateUser(userId, updateData) {
    return await User.findByIdAndUpdate(
      this.toObjectId(userId),
      updateData,
      { new: true, runValidators: true }
    ).select(this.getSensitiveFieldsExclude());
  }

  /**
   * 4. Delete a user document by ID.
   *
   * @param {string|mongoose.Types.ObjectId} userId
   * @returns {Promise<Object|null>} Deleted User document or null
   */
  async deleteUser(userId) {
    return await User.findByIdAndDelete(this.toObjectId(userId));
  }
}

export const adminUserRepository = new AdminUserRepository();
export default adminUserRepository;
