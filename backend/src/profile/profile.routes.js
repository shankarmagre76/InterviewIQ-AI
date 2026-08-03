import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  deleteProfile,
} from './profile.controller.js';
import {
  updateProfileValidation,
  validate,
} from './profile.validation.js';
import authenticate from '../middleware/auth.middleware.js';

const router = Router();

// Protect all profile endpoints (requires valid JWT)
router.use(authenticate);

router.get('/', getProfile);
router.put('/', updateProfileValidation, validate, updateProfile);
router.delete('/', deleteProfile);

export default router;
