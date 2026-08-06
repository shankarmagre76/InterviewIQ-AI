import { Router } from 'express';
import authenticate from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';
import {
  createJob,
  getJobDetails,
  updateJob,
  deleteJob,
  searchJobs,
} from './job.controller.js';
import { getJobApplications } from '../application/application.controller.js';
import {
  createJobValidation,
  updateJobValidation,
  jobIdParamValidation,
  validate,
} from './job.validation.js';

const router = Router();

/**
 * Public Routes
 */
router.get('/', searchJobs);
router.get('/:id', jobIdParamValidation, validate, getJobDetails);

/**
 * Protected Routes (Recruiter / Admin)
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('Recruiter', 'Admin'),
  createJobValidation,
  validate,
  createJob
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles('Recruiter', 'Admin'),
  updateJobValidation,
  validate,
  updateJob
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles('Recruiter', 'Admin'),
  jobIdParamValidation,
  validate,
  deleteJob
);

/**
 * Recruiter Applicants View Endpoint for a specific Job
 */
router.get(
  '/:jobId/applications',
  authenticate,
  authorizeRoles('Recruiter', 'Admin'),
  getJobApplications
);

export default router;
