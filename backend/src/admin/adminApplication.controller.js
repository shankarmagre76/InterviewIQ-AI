import asyncHandler from '../middleware/async.middleware.js';
import ApiResponse from '../utils/ApiResponse.js';
import adminApplicationService from './adminApplication.service.js';

/**
 * Admin Application Controller Layer
 * Handles HTTP requests for platform-wide application monitoring,
 * delegates to AdminApplicationService, and sends standardized HTTP responses via ApiResponse.
 * Contains ZERO business logic.
 */

/**
 * @desc    GET /api/v1/admin/applications
 *          List platform-wide candidate job applications with filters and pagination
 * @access  Private (Admin Only)
 */
export const listApplications = asyncHandler(async (req, res) => {
  const result = await adminApplicationService.listApplications(req.query);

  return new ApiResponse(
    200,
    result.applications,
    'Applications list retrieved successfully',
    {
      total: result.total,
      page: result.page,
      limit: Number(req.query.limit || 10),
      totalPages: result.totalPages,
    }
  ).send(res);
});

/**
 * @desc    GET /api/v1/admin/applications/statistics
 *          Retrieve platform-wide application metrics, conversion ratios, and company/job analytics
 * @access  Private (Admin Only)
 */
export const getApplicationStatistics = asyncHandler(async (req, res) => {
  const statistics = await adminApplicationService.getApplicationStatistics(req.query);

  return new ApiResponse(
    200,
    statistics,
    'Application monitoring statistics retrieved successfully'
  ).send(res);
});

/**
 * @desc    GET /api/v1/admin/applications/:id
 *          Retrieve specific application profile by ID
 * @access  Private (Admin Only)
 */
export const getApplicationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const application = await adminApplicationService.getApplicationById(id);

  return new ApiResponse(
    200,
    application,
    'Application details retrieved successfully'
  ).send(res);
});
