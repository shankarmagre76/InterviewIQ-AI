import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  uploadProfileImageHandler,
  deleteProfile,
} from './profile.controller.js';
import {
  updateProfileValidation,
  validate,
} from './profile.validation.js';
import authenticate from '../middleware/auth.middleware.js';
import { handleSingleUpload } from '../middleware/upload.middleware.js';

const router = Router();

// Protect all profile endpoints (requires valid JWT token)
router.use(authenticate);

/**
 * @desc    Fetch logged-in user's profile with populated user details
 * @route   GET /api/v1/profile
 * @access  Private (JWT Protected)
 */
router.get('/', getProfile);

/**
 * @desc    Update logged-in user's profile details
 * @route   PUT /api/v1/profile
 * @access  Private (JWT Protected)
 */
router.put('/', updateProfileValidation, validate, updateProfile);

/**
 * @desc    Upload & replace profile avatar image on Cloudinary
 * @route   POST /api/v1/profile/image (also accessible via PATCH /avatar)
 * @access  Private (JWT Protected)
 */
router.post('/image', handleSingleUpload('profileImage'), uploadProfileImageHandler);
router.patch('/avatar', handleSingleUpload('profileImage'), uploadProfileImageHandler);

/**
 * @desc    Delete logged-in user's profile
 * @route   DELETE /api/v1/profile
 * @access  Private (JWT Protected)
 */
router.delete('/', deleteProfile);

export default router;
