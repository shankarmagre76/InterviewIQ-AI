import { Router } from 'express';
import authenticate from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';
import {
  saveJob,
  unsaveJob,
  getUserSavedJobs,
  checkIsJobSaved,
} from './savedJob.controller.js';
import {
  saveJobValidation,
  savedJobParamValidation,
  validate,
} from './savedJob.validation.js';

const router = Router();

// All saved job routes require authentication and Student/Admin access
router.use(authenticate);
router.use(authorizeRoles('Student', 'Admin'));

router.post('/', saveJobValidation, validate, saveJob);
router.get('/', getUserSavedJobs);
router.get('/check/:jobId', savedJobParamValidation, validate, checkIsJobSaved);
router.delete('/:jobId', savedJobParamValidation, validate, unsaveJob);

export default router;
