import dashboardService from './dashboard.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../middleware/async.middleware.js';
import ApiError from '../utils/ApiError.js';

/**
 * Controller Layer for Dashboard Module
 * Handles incoming HTTP requests for candidate dashboard metrics and delegates execution to DashboardService.
 */

/**
 * @desc    GET /api/v1/dashboard
 *          Get aggregated candidate main dashboard summary
 * @access  Private (JWT Protected)
 */
export const getMainDashboard = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User authentication required');
  }

  const data = await dashboardService.getMainDashboard(userId);
  return new ApiResponse(200, data, 'Main dashboard summary retrieved successfully').send(res);
});

/**
 * @desc    GET /api/v1/dashboard/resume
 *          Get candidate resume ATS scores, history, and AI analysis breakdown
 * @access  Private (JWT Protected)
 */
export const getResumeDashboard = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User authentication required');
  }

  const data = await dashboardService.getResumeDashboard(userId);
  return new ApiResponse(200, data, 'Resume dashboard metrics retrieved successfully').send(res);
});

/**
 * @desc    GET /api/v1/dashboard/interviews
 *          Get candidate mock interview statistics, score distribution, and recency history
 * @access  Private (JWT Protected)
 */
export const getInterviewDashboard = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User authentication required');
  }

  const data = await dashboardService.getInterviewDashboard(userId);
  return new ApiResponse(200, data, 'Interview dashboard metrics retrieved successfully').send(res);
});

/**
 * @desc    GET /api/v1/dashboard/applications
 *          Get job application pipeline breakdown and status conversion metrics
 * @access  Private (JWT Protected)
 */
export const getApplicationDashboard = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User authentication required');
  }

  const data = await dashboardService.getApplicationDashboard(userId);
  return new ApiResponse(200, data, 'Application dashboard metrics retrieved successfully').send(res);
});

/**
 * @desc    GET /api/v1/dashboard/career-readiness
 *          Get composite career readiness score engine evaluation and actionable feedback
 * @access  Private (JWT Protected)
 */
export const getCareerReadinessDashboard = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User authentication required');
  }

  const data = await dashboardService.getCareerReadinessDashboard(userId);
  return new ApiResponse(200, data, 'Career readiness evaluation retrieved successfully').send(res);
});

/**
 * @desc    GET /api/v1/dashboard/activity
 *          Get paginated recent candidate activity stream
 * @access  Private (JWT Protected)
 */
export const getActivityStream = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User authentication required');
  }

  const { page = 1, limit = 10, type = null } = req.query;

  const data = await dashboardService.getActivityStream(userId, {
    page: Number(page),
    limit: Number(limit),
    type,
  });

  return new ApiResponse(200, data, 'Recent activity stream retrieved successfully').send(res);
});

// Method aliases for interface compliance
export const getDashboard = getMainDashboard;
export const getActivityDashboard = getActivityStream;
export const getApplicationAnalytics = getApplicationDashboard;
