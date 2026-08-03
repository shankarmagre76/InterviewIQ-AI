import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  uploadProfileImageHandler,
  addSkillHandler,
  getSkillsHandler,
  updateSkillHandler,
  deleteSkillHandler,
  deleteProfile,
} from './profile.controller.js';
import {
  updateProfileValidation,
  addSkillValidation,
  updateSkillValidation,
  skillIdParamValidation,
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

/* ==========================================================================
   Skills Sub-resource CRUD Endpoints
   ========================================================================== */

/**
 * @desc    Add a new skill to user profile
 * @route   POST /api/v1/profile/skills
 * @access  Private (JWT Protected)
 */
router.post('/skills', addSkillValidation, validate, addSkillHandler);

/**
 * @desc    Get all skills of logged-in user profile
 * @route   GET /api/v1/profile/skills
 * @access  Private (JWT Protected)
 */
router.get('/skills', getSkillsHandler);

/**
 * @desc    Update an existing skill in user profile by skill ID
 * @route   PUT /api/v1/profile/skills/:id
 * @access  Private (JWT Protected)
 */
router.put('/skills/:id', updateSkillValidation, validate, updateSkillHandler);

/**
 * @desc    Delete a skill from user profile by skill ID
 * @route   DELETE /api/v1/profile/skills/:id
 * @access  Private (JWT Protected)
 */
router.delete('/skills/:id', skillIdParamValidation, validate, deleteSkillHandler);

/**
 * @desc    Delete logged-in user's profile
 * @route   DELETE /api/v1/profile
 * @access  Private (JWT Protected)
 */
router.delete('/', deleteProfile);

export default router;
