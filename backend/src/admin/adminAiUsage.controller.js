import asyncHandler from '../middleware/async.middleware.js';
import ApiResponse from '../utils/ApiResponse.js';
import adminAiUsageService from './adminAiUsage.service.js';

/**
 * Admin AI Usage Controller Layer
 * Handles HTTP requests for administrative AI usage telemetry,
 * delegates to AdminAiUsageService, and sends standardized HTTP responses via ApiResponse.
 * Contains ZERO business logic.
 */

/**
 * @desc    GET /api/v1/admin/ai/usage
 *          Overall platform AI usage summary across Resume Analysis, Mock Interviews, and Roadmaps
 * @access  Private (Admin Only)
 */
export const getOverallAiUsage = asyncHandler(async (req, res) => {
  const result = await adminAiUsageService.getOverallAiUsage(req.query);

  return new ApiResponse(
    200,
    result,
    'Overall platform AI usage metrics retrieved successfully'
  ).send(res);
});

/**
 * @desc    GET /api/v1/admin/ai/resume-analysis
 *          Resume Analysis AI usage metrics, average ATS score, and paginated records list
 * @access  Private (Admin Only)
 */
export const getResumeAnalysisUsage = asyncHandler(async (req, res) => {
  const result = await adminAiUsageService.getResumeAnalysisUsage(req.query);

  return new ApiResponse(
    200,
    result.items,
    'Resume analysis AI usage metrics retrieved successfully',
    {
      total: result.total,
      page: result.page,
      limit: Number(req.query.limit || 10),
      totalPages: result.totalPages,
      avgAtsScore: result.avgAtsScore,
      tokenUsage: result.tokenUsage,
    }
  ).send(res);
});

/**
 * @desc    GET /api/v1/admin/ai/interviews
 *          AI Mock Interview usage metrics, status/difficulty breakdowns, and paginated records list
 * @access  Private (Admin Only)
 */
export const getInterviewUsage = asyncHandler(async (req, res) => {
  const result = await adminAiUsageService.getInterviewUsage(req.query);

  return new ApiResponse(
    200,
    result.items,
    'AI interview usage metrics retrieved successfully',
    {
      total: result.total,
      page: result.page,
      limit: Number(req.query.limit || 10),
      totalPages: result.totalPages,
      statusBreakdown: result.statusBreakdown,
      difficultyBreakdown: result.difficultyBreakdown,
      typeBreakdown: result.typeBreakdown,
    }
  ).send(res);
});

/**
 * @desc    GET /api/v1/admin/ai/roadmaps
 *          Learning Roadmap AI usage metrics, status breakdowns, top target roles, and paginated records list
 * @access  Private (Admin Only)
 */
export const getRoadmapUsage = asyncHandler(async (req, res) => {
  const result = await adminAiUsageService.getRoadmapUsage(req.query);

  return new ApiResponse(
    200,
    result.items,
    'Learning roadmap AI usage metrics retrieved successfully',
    {
      total: result.total,
      page: result.page,
      limit: Number(req.query.limit || 10),
      totalPages: result.totalPages,
      statusBreakdown: result.statusBreakdown,
      topTargetRoles: result.topTargetRoles,
    }
  ).send(res);
});
