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

const router = Router();

// 1. Protect all Admin routes with JWT Authentication first
router.use(authenticate);

// 2. Enforce Admin Role Authorization second
router.use(authorizeAdmin);

/* ==========================================================================
   ADMIN SYSTEM & HEALTH ROUTES (/api/v1/admin/*)
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

export default router;
