import { Router } from 'express';
import authenticate from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';
import {
  createCompany,
  getMyCompany,
  getCompany,
  updateCompany,
  deleteCompany,
  listCompanies,
} from './company.controller.js';
import {
  createCompanyValidation,
  updateCompanyValidation,
  companyIdParamValidation,
  validate,
} from './company.validation.js';

const router = Router();

/**
 * Public Routes
 */
router.get('/', listCompanies);

/**
 * Protected Recruiter Company Profile Route (must be before /:id)
 */
router.get('/my-company', authenticate, authorizeRoles('Recruiter', 'Admin'), getMyCompany);

router.get('/:id', companyIdParamValidation, validate, getCompany);

/**
 * Protected Routes (Recruiter / Admin)
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('Recruiter', 'Admin'),
  createCompanyValidation,
  validate,
  createCompany
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles('Recruiter', 'Admin'),
  updateCompanyValidation,
  validate,
  updateCompany
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles('Recruiter', 'Admin'),
  companyIdParamValidation,
  validate,
  deleteCompany
);

export default router;
