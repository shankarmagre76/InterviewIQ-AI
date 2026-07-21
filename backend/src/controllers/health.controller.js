import asyncHandler from '../middleware/async.middleware.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * @desc    Root welcome route
 * @route   GET /
 * @access  Public
 */
export const getRoot = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Welcome to InterviewIQ AI API Service',
    docs: '/api/docs',
    version: '/api/version',
    health: '/api/health',
  });
});

/**
 * @desc    API Directory overview route
 * @route   GET /api
 * @access  Public
 */
export const getApiIndex = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    name: 'InterviewIQ AI API Service',
    description: 'AI-Powered Interview Preparation Platform Backend API',
    endpoints: {
      health: '/api/health',
      version: '/api/version',
    },
  });
});

/**
 * @desc    Get system health status
 * @route   GET /api/health
 * @access  Public
 */
export const getHealth = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'InterviewIQ AI Backend Running',
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Get API version information
 * @route   GET /api/version
 * @access  Public
 */
export const getVersion = asyncHandler(async (req, res) => {
  return new ApiResponse(200, {
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    uptime: `${Math.floor(process.uptime())}s`,
  }, 'API Version Info retrieved successfully').send(res);
});
