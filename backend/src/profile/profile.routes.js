import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  uploadProfileImageHandler,
  addSkillHandler,
  getSkillsHandler,
  updateSkillHandler,
  deleteSkillHandler,
  addEducationHandler,
  getEducationHandler,
  updateEducationHandler,
  deleteEducationHandler,
  addExperienceHandler,
  getExperienceHandler,
  updateExperienceHandler,
  deleteExperienceHandler,
  getSocialLinksHandler,
  updateSocialLinksHandler,
  getResumeHandler,
  updateResumeHandler,
  uploadResumeHandler,
  deleteResumeHandler,
  getProfileCompletionHandler,
  deleteProfile,
} from './profile.controller.js';
import {
  updateProfileValidation,
  addSkillValidation,
  updateSkillValidation,
  skillIdParamValidation,
  addEducationValidation,
  updateEducationValidation,
  educationIdParamValidation,
  addExperienceValidation,
  updateExperienceValidation,
  experienceIdParamValidation,
  updateSocialLinksValidation,
  updateResumeValidation,
  validate,
} from './profile.validation.js';
import authenticate from '../middleware/auth.middleware.js';
import { handleSingleUpload, handleResumeUpload } from '../middleware/upload.middleware.js';


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
 * @desc    Calculate & return profile completion percentage
 * @route   GET /api/v1/profile/completion
 * @access  Private (JWT Protected)
 */
router.get('/completion', getProfileCompletionHandler);

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

/* ==========================================================================
   Education Sub-resource CRUD Endpoints
   ========================================================================== */

/**
 * @desc    Add a new education record to user profile
 * @route   POST /api/v1/profile/education
 * @access  Private (JWT Protected)
 */
router.post('/education', addEducationValidation, validate, addEducationHandler);

/**
 * @desc    Get all education records of logged-in user profile
 * @route   GET /api/v1/profile/education
 * @access  Private (JWT Protected)
 */
router.get('/education', getEducationHandler);

/**
 * @desc    Update an existing education record in user profile by education ID
 * @route   PUT /api/v1/profile/education/:id
 * @access  Private (JWT Protected)
 */
router.put('/education/:id', updateEducationValidation, validate, updateEducationHandler);

/**
 * @desc    Delete an education record from user profile by education ID
 * @route   DELETE /api/v1/profile/education/:id
 * @access  Private (JWT Protected)
 */
router.delete('/education/:id', educationIdParamValidation, validate, deleteEducationHandler);

/* ==========================================================================
   Experience Sub-resource CRUD Endpoints
   ========================================================================== */

/**
 * @desc    Add a new experience record to user profile
 * @route   POST /api/v1/profile/experience
 * @access  Private (JWT Protected)
 */
router.post('/experience', addExperienceValidation, validate, addExperienceHandler);

/**
 * @desc    Get all experience records of logged-in user profile
 * @route   GET /api/v1/profile/experience
 * @access  Private (JWT Protected)
 */
router.get('/experience', getExperienceHandler);

/**
 * @desc    Update an existing experience record in user profile by experience ID
 * @route   PUT /api/v1/profile/experience/:id
 * @access  Private (JWT Protected)
 */
router.put('/experience/:id', updateExperienceValidation, validate, updateExperienceHandler);

/**
 * @desc    Delete an experience record from user profile by experience ID
 * @route   DELETE /api/v1/profile/experience/:id
 * @access  Private (JWT Protected)
 */
router.delete('/experience/:id', experienceIdParamValidation, validate, deleteExperienceHandler);

/* ==========================================================================
   Social Links Sub-resource Endpoints
   ========================================================================== */

/**
 * @desc    Get social links of logged-in user profile
 * @route   GET /api/v1/profile/social-links
 * @access  Private (JWT Protected)
 */
router.get('/social-links', getSocialLinksHandler);

/**
 * @desc    Update social links of logged-in user profile
 * @route   PUT /api/v1/profile/social-links
 * @access  Private (JWT Protected)
 */
router.put('/social-links', updateSocialLinksValidation, validate, updateSocialLinksHandler);

/* ==========================================================================
   Resume Sub-resource Endpoints
   ========================================================================== */

/**
 * @desc    Upload resume document (PDF, DOC, DOCX) to Cloudinary
 * @route   POST /api/v1/profile/resume
 * @access  Private (JWT Protected)
 */
router.post('/resume', handleResumeUpload('resume'), uploadResumeHandler);

/**
 * @desc    Get resume details of logged-in user profile
 * @route   GET /api/v1/profile/resume
 * @access  Private (JWT Protected)
 */
router.get('/resume', getResumeHandler);

/**
 * @desc    Update resume details of logged-in user profile
 * @route   PUT /api/v1/profile/resume
 * @access  Private (JWT Protected)
 */
router.put('/resume', updateResumeValidation, validate, updateResumeHandler);

/**
 * @desc    Delete resume document from Cloudinary and clear profile resume details
 * @route   DELETE /api/v1/profile/resume
 * @access  Private (JWT Protected)
 */
router.delete('/resume', deleteResumeHandler);

/**
 * @desc    Delete logged-in user's profile
 * @route   DELETE /api/v1/profile
 * @access  Private (JWT Protected)
 */
router.delete('/', deleteProfile);


export default router;
