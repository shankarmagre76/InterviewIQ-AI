import { Router } from 'express';
import authenticate from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';
import {
  applyJob,
  getApplicationDetails,
  updateApplicationStatus,
  getCandidateApplications,
} from './application.controller.js';
import {
  createApplicationValidation,
  updateApplicationStatusValidation,
  applicationIdParamValidation,
  validate,
} from './application.validation.js';

const router = Router();

// All application routes require valid JWT authentication
router.use(authenticate);

/**
 * Candidate Routes (Student / Admin)
 */
router.post(
  '/',
  authorizeRoles('Student', 'Admin'),
  createApplicationValidation,
  validate,
  applyJob
);

router.get(
  '/me',
  authorizeRoles('Student', 'Admin'),
  getCandidateApplications
);

/**
 * Recruiter Status Management Route (Recruiter / Admin)
 */
router.patch(
  '/:id/status',
  authorizeRoles('Recruiter', 'Admin'),
  updateApplicationStatusValidation,
  validate,
  updateApplicationStatus
);

/**
 * Application Details View Route (Candidate Applicant, Recruiter, Admin)
 */
router.get(
  '/:id',
  applicationIdParamValidation,
  validate,
  getApplicationDetails
);

export default router;
