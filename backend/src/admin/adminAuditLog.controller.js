import asyncHandler from '../middleware/async.middleware.js';
import ApiResponse from '../utils/ApiResponse.js';
import adminAuditLogService from './adminAuditLog.service.js';

/**
 * Admin Audit Log Controller Layer
 * Handles HTTP requests for viewing administrative audit logs,
 * delegates to AdminAuditLogService, and sends standardized HTTP responses via ApiResponse.
 * Contains ZERO business logic.
 */

/**
 * @desc    GET /api/v1/admin/audit-logs
 *          Retrieve paginated administrative audit logs with filters
 * @access  Private (Admin Only)
 */
export const listAuditLogs = asyncHandler(async (req, res) => {
  const result = await adminAuditLogService.listAuditLogs(req.query);

  return new ApiResponse(
    200,
    result.logs,
    'Audit logs retrieved successfully',
    {
      total: result.total,
      page: result.page,
      limit: Number(req.query.limit || 10),
      totalPages: result.totalPages,
    }
  ).send(res);
});

/**
 * @desc    GET /api/v1/admin/audit-logs/:id
 *          Retrieve single audit log record by ID
 * @access  Private (Admin Only)
 */
export const getAuditLogById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const log = await adminAuditLogService.getAuditLogById(id);

  return new ApiResponse(
    200,
    log,
    'Audit log record retrieved successfully'
  ).send(res);
});
