import { Router } from 'express';
import authenticate from '../middleware/auth.middleware.js';
import { authorizeAdmin } from '../middleware/role.middleware.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../middleware/async.middleware.js';

// User Controllers & Validations
import {
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
} from './adminUser.controller.js';
import {
  userIdParamValidation,
  userQueryValidation,
  updateStatusValidation,
  updateRoleValidation,
} from './adminUser.validation.js';

// Company Controllers & Validations
import {
  listCompanies,
  createCompany,
  getCompanyById,
  updateCompany,
  updateCompanyStatus,
  deleteCompany,
} from './adminCompany.controller.js';
import {
  adminCompanyQueryValidation,
  adminCompanyStatusValidation,
  createCompanyValidation,
  updateCompanyValidation,
  companyIdParamValidation,
} from './adminCompany.validation.js';

// Job Controllers & Validations
import {
  listJobs,
  createJob,
  getJobById,
  updateJob,
  updateJobStatus,
  deleteJob,
} from './adminJob.controller.js';
import {
  adminJobQueryValidation,
  adminJobStatusValidation,
  createJobValidation,
  updateJobValidation,
  jobIdParamValidation,
} from './adminJob.validation.js';

// Application Monitoring Controllers & Validations
import {
  listApplications,
  getApplicationById,
  getApplicationStatistics,
} from './adminApplication.controller.js';
import {
  adminApplicationQueryValidation,
  applicationIdParamValidation,
} from './adminApplication.validation.js';

// AI Usage Telemetry Monitoring Controllers & Validations
import {
  getOverallAiUsage,
  getResumeAnalysisUsage,
  getInterviewUsage,
  getRoadmapUsage,
} from './adminAiUsage.controller.js';
import { adminAiQueryValidation } from './adminAiUsage.validation.js';

// Platform Analytics Controllers & Validations
import {
  getDashboardOverview,
  getUserAnalytics,
  getJobAnalytics,
  getApplicationAnalytics,
  getAiAnalytics,
} from './adminAnalytics.controller.js';
import { adminAnalyticsQueryValidation } from './adminAnalytics.validation.js';

// Audit Logging Controllers & Validations
import {
  listAuditLogs,
  getAuditLogById,
} from './adminAuditLog.controller.js';
import {
  adminAuditLogQueryValidation,
  auditLogIdParamValidation,
} from './adminAuditLog.validation.js';

// Admin System Notification Announcement Controllers & Validations
import {
  sendAnnouncement,
  listSentNotifications,
  getNotificationById,
  deleteNotification,
} from './adminNotification.controller.js';
import {
  sendAnnouncementValidation,
  adminNotificationQueryValidation,
  notificationIdParamValidation,
} from './adminNotification.validation.js';

const router = Router();

// 1. Protect all Admin routes with JWT Authentication first
router.use(authenticate);

// 2. Enforce Admin Role Authorization second
router.use(authorizeAdmin);

/* ==========================================================================
   ADMIN SYSTEM & HEALTH & DASHBOARD ROUTES (/api/v1/admin/*)
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
 *          Comprehensive platform dashboard summary metrics overview across all entities
 * @access  Private (Admin Only)
 */
router.get('/dashboard', getDashboardOverview);

/* ==========================================================================
   ADMIN SYSTEM NOTIFICATION ANNOUNCEMENT ROUTES (/api/v1/admin/notifications/*)
   ========================================================================== */

// POST /api/v1/admin/notifications - Broadcast in-app system announcement (ALL, USERS, ROLE)
router.post('/notifications', sendAnnouncementValidation, sendAnnouncement);

// GET /api/v1/admin/notifications - List sent notifications
router.get('/notifications', adminNotificationQueryValidation, listSentNotifications);

// GET /api/v1/admin/notifications/:id - View single notification
router.get('/notifications/:id', notificationIdParamValidation, getNotificationById);

// DELETE /api/v1/admin/notifications/:id - Delete single notification
router.delete('/notifications/:id', notificationIdParamValidation, deleteNotification);

/* ==========================================================================
   ADMIN ANALYTICS ROUTES (/api/v1/admin/analytics/*)
   ========================================================================== */

// GET /api/v1/admin/analytics/users - User growth, status, & role analytics
router.get('/analytics/users', adminAnalyticsQueryValidation, getUserAnalytics);

// GET /api/v1/admin/analytics/jobs - Job & company analytics, workMode/employmentType
router.get('/analytics/jobs', getJobAnalytics);

// GET /api/v1/admin/analytics/applications - Application status distribution & conversion rates
router.get('/analytics/applications', adminAnalyticsQueryValidation, getApplicationAnalytics);

// GET /api/v1/admin/analytics/ai - AI consumption analytics across all 3 features
router.get('/analytics/ai', adminAnalyticsQueryValidation, getAiAnalytics);

/* ==========================================================================
   ADMIN AUDIT LOGGING ROUTES (/api/v1/admin/audit-logs/*)
   ========================================================================== */

// GET /api/v1/admin/audit-logs - List administrative audit trail logs
router.get('/audit-logs', adminAuditLogQueryValidation, listAuditLogs);

// GET /api/v1/admin/audit-logs/:id - View single audit log details
router.get('/audit-logs/:id', auditLogIdParamValidation, getAuditLogById);

/* ==========================================================================
   ADMIN USER MANAGEMENT ROUTES (/api/v1/admin/users/*)
   ========================================================================== */

// GET /api/v1/admin/users - List users (Paginated, Search, Filter, Sort)
router.get('/users', userQueryValidation, getUsers);

// GET /api/v1/admin/users/:id - View user details
router.get('/users/:id', userIdParamValidation, getUserById);

// PATCH /api/v1/admin/users/:id/status - Activate or Deactivate user
router.patch('/users/:id/status', updateStatusValidation, updateUserStatus);

// PATCH /api/v1/admin/users/:id/role - Change user role
router.patch('/users/:id/role', updateRoleValidation, updateUserRole);

// DELETE /api/v1/admin/users/:id - Delete user account
router.delete('/users/:id', userIdParamValidation, deleteUser);

/* ==========================================================================
   ADMIN COMPANY MANAGEMENT ROUTES (/api/v1/admin/companies/*)
   ========================================================================== */

// GET /api/v1/admin/companies - List companies (Paginated, Search, Filter)
router.get('/companies', adminCompanyQueryValidation, listCompanies);

// POST /api/v1/admin/companies - Create company profile
router.post('/companies', createCompanyValidation, createCompany);

// GET /api/v1/admin/companies/:id - View company details
router.get('/companies/:id', companyIdParamValidation, getCompanyById);

// PUT /api/v1/admin/companies/:id - Update company profile
router.put('/companies/:id', updateCompanyValidation, updateCompany);

// PATCH /api/v1/admin/companies/:id - Update company profile (partial)
router.patch('/companies/:id', updateCompanyValidation, updateCompany);

// PATCH /api/v1/admin/companies/:id/status - Update company hiring status
router.patch('/companies/:id/status', adminCompanyStatusValidation, updateCompanyStatus);

// DELETE /api/v1/admin/companies/:id - Delete company profile (with Job Safety Guard)
router.delete('/companies/:id', companyIdParamValidation, deleteCompany);

/* ==========================================================================
   ADMIN JOB MANAGEMENT ROUTES (/api/v1/admin/jobs/*)
   ========================================================================== */

// GET /api/v1/admin/jobs - List all jobs (Paginated, Search, Filter, Sort)
router.get('/jobs', adminJobQueryValidation, listJobs);

// POST /api/v1/admin/jobs - Create job posting
router.post('/jobs', createJobValidation, createJob);

// GET /api/v1/admin/jobs/:id - View job details
router.get('/jobs/:id', jobIdParamValidation, getJobById);

// PUT /api/v1/admin/jobs/:id - Update job posting
router.put('/jobs/:id', updateJobValidation, updateJob);

// PATCH /api/v1/admin/jobs/:id - Update job posting (partial)
router.patch('/jobs/:id', updateJobValidation, updateJob);

// PATCH /api/v1/admin/jobs/:id/status - Update job status
router.patch('/jobs/:id/status', adminJobStatusValidation, updateJobStatus);

// DELETE /api/v1/admin/jobs/:id - Delete job posting (with Application Safety Guard)
router.delete('/jobs/:id', jobIdParamValidation, deleteJob);

/* ==========================================================================
   ADMIN APPLICATION MONITORING ROUTES (/api/v1/admin/applications/*)
   ========================================================================== */

// GET /api/v1/admin/applications/statistics - Platform-wide application metrics
router.get('/applications/statistics', adminApplicationQueryValidation, getApplicationStatistics);

// GET /api/v1/admin/applications - List platform-wide candidate applications
router.get('/applications', adminApplicationQueryValidation, listApplications);

// GET /api/v1/admin/applications/:id - View application details
router.get('/applications/:id', applicationIdParamValidation, getApplicationById);

/* ==========================================================================
   ADMIN AI USAGE MONITORING ROUTES (/api/v1/admin/ai/*)
   ========================================================================== */

// GET /api/v1/admin/ai/usage - Overall AI usage summary & top user analytics
router.get('/ai/usage', adminAiQueryValidation, getOverallAiUsage);

// GET /api/v1/admin/ai/resume-analysis - Resume analysis AI usage metrics
router.get('/ai/resume-analysis', adminAiQueryValidation, getResumeAnalysisUsage);

// GET /api/v1/admin/ai/interviews - AI mock interview usage metrics
router.get('/ai/interviews', adminAiQueryValidation, getInterviewUsage);

// GET /api/v1/admin/ai/roadmaps - Learning roadmap AI usage metrics
router.get('/ai/roadmaps', adminAiQueryValidation, getRoadmapUsage);

export default router;
