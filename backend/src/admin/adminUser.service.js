import adminUserRepository from './adminUser.repository.js';
import adminAuditLogService from './adminAuditLog.service.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { createSafeRegex } from '../utils/regex.util.js';

const ALLOWED_ROLES = ['Student', 'Recruiter', 'Admin'];

/**
 * Admin User Service Layer
 * Enforces administrative business rules, self-protection guards, and input normalization.
 * Contains ZERO direct MongoDB queries (delegates to AdminUserRepository).
 */
class AdminUserService {
  /**
   * Normalize input role string to exact User model casing
   */
  normalizeRole(roleStr) {
    if (!roleStr) return null;
    const lower = String(roleStr).trim().toLowerCase();
    if (lower === 'student' || lower === 'candidate') return 'Student';
    if (lower === 'recruiter' || lower === 'interviewer') return 'Recruiter';
    if (lower === 'admin') return 'Admin';
    return roleStr;
  }

  /**
   * 1. List users with search, role, status filters, sorting, and pagination.
   *
   * @param {Object} queryParams - { page, limit, search, role, status, sortBy, sortOrder }
   * @returns {Promise<Object>} { users, pagination }
   */
  async listUsers(queryParams = {}) {
    const {
      page = 1,
      limit = 10,
      search = null,
      role = null,
      status = null,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryParams;

    const filter = {};

    // Search query on firstName, lastName, or email
    if (search && String(search).trim()) {
      const searchRegex = createSafeRegex(String(search));
      if (searchRegex) {
        filter.$or = [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
        ];
      }
    }

    // Filter by role
    if (role && String(role).trim()) {
      const normalizedRole = this.normalizeRole(role);
      filter.role = normalizedRole;
    }

    // Filter by status (isActive)
    if (status !== null && status !== undefined && status !== '') {
      const statusStr = String(status).trim().toLowerCase();
      if (statusStr === 'active' || statusStr === 'true' || statusStr === '1') {
        filter.isActive = true;
      } else if (
        statusStr === 'deactivated' ||
        statusStr === 'inactive' ||
        statusStr === 'false' ||
        statusStr === '0'
      ) {
        filter.isActive = false;
      }
    }

    // Sorting calculation
    const allowedSortFields = ['createdAt', 'firstName,', 'lastName', 'email', 'role', 'isActive'];
    const actualSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const actualSortOrder = String(sortOrder).toLowerCase() === 'asc' || sortOrder === '1' || sortOrder === 1 ? 1 : -1;

    return await adminUserRepository.getUsers(filter, {
      page: Number(page),
      limit: Number(limit),
      sortBy: actualSortBy,
      sortOrder: actualSortOrder,
    });
  }

  /**
   * 2. Retrieve user details by ID.
   *
   * @param {string} userId
   * @returns {Promise<Object>} User document (sensitive fields stripped)
   */
  async getUserById(userId) {
    const user = await adminUserRepository.getUserById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }

  /**
   * 3. Update user active status (Activate / Deactivate) with Admin self-deactivation guard.
   *
   * @param {string} targetUserId
   * @param {string} adminUserId
   * @param {Object} statusData - { isActive: boolean } or { status: string }
   * @returns {Promise<Object>} Updated User document
   */
  async updateUserStatus(targetUserId, adminUserId, statusData = {}) {
    const existingUser = await adminUserRepository.getUserById(targetUserId);
    if (!existingUser) {
      throw ApiError.notFound('User not found');
    }

    // Resolve target isActive status boolean
    let newIsActive = existingUser.isActive;
    if (statusData.isActive !== undefined) {
      newIsActive = Boolean(statusData.isActive);
    } else if (statusData.status) {
      const statusStr = String(statusData.status).trim().toLowerCase();
      if (statusStr === 'active' || statusStr === 'true') {
        newIsActive = true;
      } else if (statusStr === 'deactivated' || statusStr === 'inactive' || statusStr === 'false') {
        newIsActive = false;
      }
    }

    // Self-Protection Guard: Prevent admin from deactivating their own account
    if (String(targetUserId) === String(adminUserId) && newIsActive === false) {
      throw ApiError.badRequest('Admin cannot deactivate their own account');
    }

    const updatedUser = await adminUserRepository.updateUser(targetUserId, {
      isActive: newIsActive,
    });

    logger.info(
      `Admin (${adminUserId}) updated status of User (${targetUserId}) to isActive=${newIsActive}`
    );

    // Non-blocking Audit Logging
    const action = newIsActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER';
    adminAuditLogService.logAction({
      admin: adminUserId,
      action,
      targetType: 'User',
      targetId: targetUserId,
      description: `Admin updated user status to isActive=${newIsActive}`,
      metadata: { previousStatus: existingUser.isActive, newStatus: newIsActive },
    });

    return updatedUser;
  }

  /**
   * 4. Update user role with validation & Admin self-demotion guard.
   *
   * @param {string} targetUserId
   * @param {string} adminUserId
   * @param {Object} roleData - { role: 'Student' | 'Recruiter' | 'Admin' }
   * @returns {Promise<Object>} Updated User document
   */
  async updateUserRole(targetUserId, adminUserId, roleData = {}) {
    const existingUser = await adminUserRepository.getUserById(targetUserId);
    if (!existingUser) {
      throw ApiError.notFound('User not found');
    }

    const normalizedRole = this.normalizeRole(roleData.role);
    if (!normalizedRole || !ALLOWED_ROLES.includes(normalizedRole)) {
      throw ApiError.badRequest(
        `Invalid role '${roleData.role}'. Allowed roles are: ${ALLOWED_ROLES.join(', ')}`
      );
    }

    // Self-Protection Guard: Prevent admin from revoking their own Admin role
    if (String(targetUserId) === String(adminUserId) && normalizedRole !== 'Admin') {
      throw ApiError.badRequest('Admin cannot revoke their own admin role');
    }

    const updatedUser = await adminUserRepository.updateUser(targetUserId, {
      role: normalizedRole,
    });

    logger.info(
      `Admin (${adminUserId}) updated role of User (${targetUserId}) to '${normalizedRole}'`
    );

    // Non-blocking Audit Logging
    adminAuditLogService.logAction({
      admin: adminUserId,
      action: 'CHANGE_USER_ROLE',
      targetType: 'User',
      targetId: targetUserId,
      description: `Admin updated user role from '${existingUser.role}' to '${normalizedRole}'`,
      metadata: { previousRole: existingUser.role, newRole: normalizedRole },
    });

    return updatedUser;
  }

  /**
   * 5. Delete a user document with Admin self-deletion guard.
   *
   * @param {string} targetUserId
   * @param {string} adminUserId
   * @returns {Promise<Object>} Confirmation message and deleted ID
   */
  async deleteUser(targetUserId, adminUserId) {
    const existingUser = await adminUserRepository.getUserById(targetUserId);
    if (!existingUser) {
      throw ApiError.notFound('User not found');
    }

    // Self-Protection Guard: Prevent admin from deleting their own account
    if (String(targetUserId) === String(adminUserId)) {
      throw ApiError.badRequest('Admin cannot delete their own account');
    }

    await adminUserRepository.deleteUser(targetUserId);

    logger.info(`Admin (${adminUserId}) deleted User (${targetUserId})`);

    // Non-blocking Audit Logging
    adminAuditLogService.logAction({
      admin: adminUserId,
      action: 'DELETE_USER',
      targetType: 'User',
      targetId: targetUserId,
      description: `Admin deleted user account (${targetUserId})`,
      metadata: { deletedEmail: existingUser.email, deletedRole: existingUser.role },
    });

    return {
      message: 'User account deleted successfully',
      deletedUserId: targetUserId,
    };
  }
}

export const adminUserService = new AdminUserService();
export default adminUserService;
