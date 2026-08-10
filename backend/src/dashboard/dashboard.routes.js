import { Router } from 'express';
import {
  getMainDashboard,
  getResumeDashboard,
  getInterviewDashboard,
  getApplicationDashboard,
  getCareerReadinessDashboard,
  getActivityStream,
} from './dashboard.controller.js';
import {
  analyticsQueryValidation,
  activityQueryValidation,
} from './dashboard.validation.js';
import authenticate from '../middleware/auth.middleware.js';

const router = Router();

// Enforce JWT Authentication across all dashboard endpoints
router.use(authenticate);

/**
 * @desc    GET /api/v1/dashboard
 *          Main aggregated candidate dashboard summary
 * @access  Private (JWT Protected)
 */
router.get('/', analyticsQueryValidation, getMainDashboard);

/**
 * @desc    GET /api/v1/dashboard/resume
 *          Detailed resume metrics & ATS history breakdown
 * @access  Private (JWT Protected)
 */
router.get('/resume', analyticsQueryValidation, getResumeDashboard);

/**
 * @desc    GET /api/v1/dashboard/interviews
 *          Detailed mock interview performance metrics and score distribution
 * @access  Private (JWT Protected)
 */
router.get('/interviews', analyticsQueryValidation, getInterviewDashboard);

/**
 * @desc    GET /api/v1/dashboard/applications
 *          Detailed job application pipeline and funnel conversion metrics
 * @access  Private (JWT Protected)
 */
router.get('/applications', analyticsQueryValidation, getApplicationDashboard);

/**
 * @desc    GET /api/v1/dashboard/career-readiness
 *          Composite career readiness evaluation score engine
 * @access  Private (JWT Protected)
 */
router.get('/career-readiness', analyticsQueryValidation, getCareerReadinessDashboard);

/**
 * @desc    GET /api/v1/dashboard/activity
 *          Paginated activity feed stream across all candidate actions
 * @access  Private (JWT Protected)
 */
router.get('/activity', activityQueryValidation, getActivityStream);

export default router;
