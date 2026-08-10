import { Router } from 'express';
import {
  getMainDashboard,
  getResumeDashboard,
  getInterviewDashboard,
  getApplicationDashboard,
  getCareerReadinessDashboard,
  getActivityStream,
} from './dashboard.controller.js';
import authenticate from '../middleware/auth.middleware.js';

const router = Router();

// Enforce JWT Authentication across all dashboard endpoints
router.use(authenticate);

/**
 * @desc    GET /api/v1/dashboard
 *          Main aggregated candidate dashboard
 * @access  Private (JWT Protected)
 */
router.get('/', getMainDashboard);

/**
 * @desc    GET /api/v1/dashboard/resume
 *          Detailed resume metrics & ATS history breakdown
 * @access  Private (JWT Protected)
 */
router.get('/resume', getResumeDashboard);

/**
 * @desc    GET /api/v1/dashboard/interviews
 *          Detailed mock interview performance metrics and score distribution
 * @access  Private (JWT Protected)
 */
router.get('/interviews', getInterviewDashboard);

/**
 * @desc    GET /api/v1/dashboard/applications
 *          Detailed job application pipeline and funnel conversion metrics
 * @access  Private (JWT Protected)
 */
router.get('/applications', getApplicationDashboard);

/**
 * @desc    GET /api/v1/dashboard/career-readiness
 *          Composite career readiness evaluation score engine
 * @access  Private (JWT Protected)
 */
router.get('/career-readiness', getCareerReadinessDashboard);

/**
 * @desc    GET /api/v1/dashboard/activity
 *          Paginated activity feed stream across all candidate actions
 * @access  Private (JWT Protected)
 */
router.get('/activity', getActivityStream);

export default router;
