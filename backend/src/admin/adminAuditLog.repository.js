import AdminAuditLog from './adminAuditLog.model.js';

/**
 * Admin Audit Log Repository Layer
 * Handles pure Mongoose database queries for AdminAuditLog collection.
 * Contains ZERO business logic.
 */
class AdminAuditLogRepository {
  /**
   * Create a new administrative audit log document.
   * @param {Object} logData
   * @returns {Promise<import('./adminAuditLog.model.js').default>} Created audit log document
   */
  async createLog(logData) {
    return await AdminAuditLog.create(logData);
  }

  /**
   * Retrieve a paginated list of audit logs based on query filters.
   * @param {Object} [filter={}] - Filter options (admin, action, targetType, dateFrom, dateTo)
   * @param {Object} [options={}] - Options (page, limit, sort)
   * @returns {Promise<{ logs: Array, total: number, page: number, totalPages: number }>}
   */
  async getLogs(filter = {}, options = {}) {
    const page = Math.max(1, parseInt(options.page || 1, 10));
    const limit = Math.max(1, parseInt(options.limit || 10, 10));
    const skip = (page - 1) * limit;
    const sort = options.sort || { createdAt: -1 };

    const queryFilter = { ...filter };

    const [logs, total] = await Promise.all([
      AdminAuditLog.find(queryFilter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('admin', 'firstName lastName email role')
        .exec(),
      AdminAuditLog.countDocuments(queryFilter),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Retrieve single audit log by ID.
   * @param {string|import('mongoose').Types.ObjectId} id
   * @returns {Promise<import('./adminAuditLog.model.js').default|null>} Audit log document or null
   */
  async getLogById(id) {
    return await AdminAuditLog.findById(id)
      .populate('admin', 'firstName lastName email role')
      .exec();
  }
}

export const adminAuditLogRepository = new AdminAuditLogRepository();
export default adminAuditLogRepository;
