import { Router } from 'express';
import authenticate from '../middleware/auth.middleware.js';
import { authorizeAdmin } from '../middleware/role.middleware.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../middleware/async.middleware.js';

const router = Router();

// 1. Enforce Authentication (Verify JWT token first)
router.use(authenticate);

// 2. Enforce Authorization (Verify authenticated user has Admin role)
router.use(authorizeAdmin);

/* ==========================================================================
   ADMINISTRATIVE ENDPOINTS (/api/v1/admin/*)
   ========================================================================== */

/**
 * @desc    GET /api/v1/admin/health
 *          Admin system health check
 * @access  Private (Admin Only)
 */
router.get(
  '/health',
  asyncHandler(async (req, res) => {
    return new ApiResponse(
      200,
      {
        adminUser: {
          id: req.user._id || req.user.id,
          email: req.user.email,
          role: req.user.role,
        },
        status: 'HEALTHY',
        timestamp: new Date().toISOString(),
      },
      'Admin system authorization verified successfully'
    ).send(res);
  })
);

/**
 * @desc    GET /api/v1/admin/dashboard
 *          Admin platform dashboard metrics
 * @access  Private (Admin Only)
 */
router.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    return new ApiResponse(
      200,
      {
        totalUsers: 0,
        activeInterviews: 0,
        generatedRoadmaps: 0,
        systemStatus: 'ONLINE',
      },
      'Admin dashboard data retrieved successfully'
    ).send(res);
  })
);

export default router;
