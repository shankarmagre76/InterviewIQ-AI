import { Router } from 'express';
import {
  getMainDashboard,
  getResumeDashboard,
  getInterviewDashboard,
  getApplicationDashboard,
  getCareerReadinessDashboard,
  getActivityStream,
  getRecruiterDashboard,
} from './dashboard.controller.js';
import {
  analyticsQueryValidation,
  activityQueryValidation,
} from './dashboard.validation.js';
import authenticate from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

const router = Router();

// Enforce JWT Authentication across all dashboard endpoints
router.use(authenticate);

/**
 * @desc    GET /api/v1/dashboard/recruiter
 *          Recruiter overview dashboard metrics
 * @access  Private (Recruiter / Admin Only)
 */
router.get('/recruiter', authorizeRoles('Recruiter', 'Admin'), getRecruiterDashboard);

/**
 * @desc    GET /api/v1/dashboard
 *          Main aggregated candidate dashboard summary
 * @access  Private (Candidate / Admin Only)
 */
router.get('/', authorizeRoles('Student', 'Admin'), analyticsQueryValidation, getMainDashboard);

/**
 * @desc    GET /api/v1/dashboard/resume
 *          Detailed resume metrics & ATS history breakdown
 * @access  Private (Candidate / Admin Only)
 */
router.get('/resume', authorizeRoles('Student', 'Admin'), analyticsQueryValidation, getResumeDashboard);

/**
 * @desc    GET /api/v1/dashboard/interviews
 *          Detailed mock interview performance metrics and score distribution
 * @access  Private (Candidate / Admin Only)
 */
router.get('/interviews', authorizeRoles('Student', 'Admin'), analyticsQueryValidation, getInterviewDashboard);

/**
 * @desc    GET /api/v1/dashboard/applications
 *          Detailed job application pipeline and funnel conversion metrics
 * @access  Private (Candidate / Admin Only)
 */
router.get('/applications', authorizeRoles('Student', 'Admin'), analyticsQueryValidation, getApplicationDashboard);

/**
 * @desc    GET /api/v1/dashboard/career-readiness
 *          Composite career readiness evaluation score engine
 * @access  Private (Candidate / Admin Only)
 */
router.get('/career-readiness', authorizeRoles('Student', 'Admin'), analyticsQueryValidation, getCareerReadinessDashboard);

/**
 * @desc    GET /api/v1/dashboard/activity
 *          Paginated activity feed stream across all candidate actions
 * @access  Private (Candidate / Admin Only)
 */
router.get('/activity', authorizeRoles('Student', 'Admin'), activityQueryValidation, getActivityStream);

export default router;
