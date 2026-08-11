import adminAuditLogRepository from './adminAuditLog.repository.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import mongoose from 'mongoose';

const SENSITIVE_KEY_REGEX = /password|pass|token|jwt|secret|apikey|key|credential|auth/i;

/**
 * Admin Audit Log Service Layer
 * Sanitizes metadata, enforces non-blocking audit logging execution, and processes query filters.
 */
class AdminAuditLogService {
  /**
   * Deep copy & sanitize metadata object to strip passwords, tokens, keys, and credentials
   */
  sanitizeMetadata(data) {
    if (!data || typeof data !== 'object') return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeMetadata(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_KEY_REGEX.test(key)) {
        sanitized[key] = '[REDACTED_SECRET]';
      } else if (value && typeof value === 'object') {
        sanitized[key] = this.sanitizeMetadata(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  /**
   * Non-blocking Audit Logger.
   * Invoked across admin actions to record audit trails safely.
   *
   * @param {Object} logPayload - { admin, action, targetType, targetId, description, metadata, ipAddress, userAgent }
   * @returns {Promise<Object|null>} Saved log document or null if logging caught error
   */
  async logAction(logPayload = {}) {
    try {
      if (!logPayload.admin || !logPayload.action || !logPayload.targetType) {
        logger.warn('Skipping incomplete audit log payload:', logPayload);
        return null;
      }

      const sanitizedMetadata = this.sanitizeMetadata(logPayload.metadata || {});

      const payload = {
        admin: logPayload.admin,
        action: logPayload.action,
        targetType: logPayload.targetType,
        targetId: logPayload.targetId || null,
        description: logPayload.description || `Admin performed ${logPayload.action}`,
        metadata: sanitizedMetadata,
        ipAddress: logPayload.ipAddress || '',
        userAgent: logPayload.userAgent || '',
      };

      return await adminAuditLogRepository.createLog(payload);
    } catch (err) {
      // Non-blocking safety net: log error silently without throwing exception to caller
      logger.error(`Non-blocking audit log creation failed for action '${logPayload?.action}':`, err.message);
      return null;
    }
  }

  /**
   * List audit logs with pagination and filters.
   *
   * @param {Object} queryParams - { page, limit, admin, action, targetType, dateFrom, dateTo, sortBy, sortOrder }
   * @returns {Promise<Object>} Paginated audit log result
   */
  async listAuditLogs(queryParams = {}) {
    const {
      page = 1,
      limit = 10,
      admin = null,
      action = null,
      targetType = null,
      dateFrom = null,
      dateTo = null,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryParams;

    const filter = {};

    if (admin && mongoose.Types.ObjectId.isValid(admin)) {
      filter.admin = new mongoose.Types.ObjectId(admin);
    }

    if (action && String(action).trim()) {
      filter.action = String(action).trim();
    }

    if (targetType && String(targetType).trim()) {
      filter.targetType = String(targetType).trim();
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const actualSortOrder = String(sortOrder).toLowerCase() === 'asc' || sortOrder === '1' || sortOrder === 1 ? 1 : -1;
    const sort = { [sortBy]: actualSortOrder };

    return await adminAuditLogRepository.getLogs(filter, {
      page: Number(page),
      limit: Number(limit),
      sort,
    });
  }

  /**
   * Retrieve single audit log detail by ID.
   *
   * @param {string} logId
   * @returns {Promise<Object>} Audit log record
   */
  async getAuditLogById(logId) {
    const log = await adminAuditLogRepository.getLogById(logId);
    if (!log) {
      throw ApiError.notFound('Audit log record not found');
    }
    return log;
  }
}

export const adminAuditLogService = new AdminAuditLogService();
export default adminAuditLogService;
