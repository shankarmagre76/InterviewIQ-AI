import asyncHandler from '../middleware/async.middleware.js';
import ApiResponse from '../utils/ApiResponse.js';
import adminAnalyticsService from './adminAnalytics.service.js';

/**
 * Admin Analytics Controller Layer
 * Handles HTTP requests for platform-wide analytics and dashboard reporting,
 * delegates to AdminAnalyticsService, and sends standardized HTTP responses via ApiResponse.
 * Contains ZERO business logic.
 */

/**
 * @desc    GET /api/v1/admin/dashboard
 *          Comprehensive platform dashboard metrics overview
 * @access  Private (Admin Only)
 */
export const getDashboardOverview = asyncHandler(async (req, res) => {
  const result = await adminAnalyticsService.getDashboardOverview();

  return new ApiResponse(
    200,
    result,
    'Admin dashboard overview retrieved successfully'
  ).send(res);
});

/**
 * @desc    GET /api/v1/admin/analytics/users
 *          Detailed user registration growth, status, and role breakdown analytics
 * @access  Private (Admin Only)
 */
export const getUserAnalytics = asyncHandler(async (req, res) => {
  const result = await adminAnalyticsService.getUserAnalytics(req.query);

  return new ApiResponse(
    200,
    result,
    'User analytics retrieved successfully'
  ).send(res);
});

/**
 * @desc    GET /api/v1/admin/analytics/jobs
 *          Detailed company and job posting status, workMode, and employmentType analytics
 * @access  Private (Admin Only)
 */
export const getJobAnalytics = asyncHandler(async (req, res) => {
  const result = await adminAnalyticsService.getJobAnalytics();

  return new ApiResponse(
    200,
    result,
    'Job analytics retrieved successfully'
  ).send(res);
});

/**
 * @desc    GET /api/v1/admin/analytics/applications
 *          Detailed candidate application status distribution, volume trends, and conversion rates
 * @access  Private (Admin Only)
 */
export const getApplicationAnalytics = asyncHandler(async (req, res) => {
  const result = await adminAnalyticsService.getApplicationAnalytics(req.query);

  return new ApiResponse(
    200,
    result,
    'Application analytics retrieved successfully'
  ).send(res);
});

/**
 * @desc    GET /api/v1/admin/analytics/ai
 *          Detailed AI consumption analytics across Resume Analysis, Mock Interviews, and Roadmaps
 * @access  Private (Admin Only)
 */
export const getAiAnalytics = asyncHandler(async (req, res) => {
  const result = await adminAnalyticsService.getAiAnalytics(req.query);

  return new ApiResponse(
    200,
    result,
    'AI analytics retrieved successfully'
  ).send(res);
});
