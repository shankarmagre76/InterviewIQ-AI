import profileService from './profile.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../middleware/async.middleware.js';

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/v1/profile
 * @access  Private (JWT Protected)
 */
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const profile = await profileService.getProfileByUserId(userId);
  return new ApiResponse(200, profile, 'User profile retrieved successfully').send(res);
});

/**
 * @desc    Update user profile details
 * @route   PUT /api/v1/profile
 * @access  Private (JWT Protected)
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const updatedProfile = await profileService.updateProfileByUserId(userId, req.body);
  return new ApiResponse(200, updatedProfile, 'Profile updated successfully').send(res);
});

/**
 * @desc    Upload & replace user profile avatar image
 * @route   POST /api/v1/profile/image (or PATCH /api/v1/profile/avatar)
 * @access  Private (JWT Protected)
 */
export const uploadProfileImageHandler = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No image file uploaded. Please attach an image under the "profileImage" field.');
  }

  const userId = req.user?._id || req.user?.id;
  const updatedProfile = await profileService.uploadProfileImage(userId, req.file.buffer);

  return new ApiResponse(200, updatedProfile, 'Profile image uploaded successfully').send(res);
});

/* ==========================================================================
   Skills Handlers
   ========================================================================== */

/**
 * @desc    Add a new skill to user profile
 * @route   POST /api/v1/profile/skills
 * @access  Private (JWT Protected)
 */
export const addSkillHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const skills = await profileService.addSkill(userId, req.body);
  return new ApiResponse(201, skills, 'Skill added successfully').send(res);
});

/**
 * @desc    Get all skills of logged-in user profile
 * @route   GET /api/v1/profile/skills
 * @access  Private (JWT Protected)
 */
export const getSkillsHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const skills = await profileService.getSkills(userId);
  return new ApiResponse(200, skills, 'Skills retrieved successfully').send(res);
});

/**
 * @desc    Update an existing skill in user profile
 * @route   PUT /api/v1/profile/skills/:id
 * @access  Private (JWT Protected)
 */
export const updateSkillHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const skillId = req.params.id;
  const updatedSkill = await profileService.updateSkill(userId, skillId, req.body);
  return new ApiResponse(200, updatedSkill, 'Skill updated successfully').send(res);
});

/**
 * @desc    Delete a skill from user profile
 * @route   DELETE /api/v1/profile/skills/:id
 * @access  Private (JWT Protected)
 */
export const deleteSkillHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const skillId = req.params.id;
  await profileService.deleteSkill(userId, skillId);
  return new ApiResponse(200, null, 'Skill deleted successfully').send(res);
});

/* ==========================================================================
   Education Handlers
   ========================================================================== */

/**
 * @desc    Add a new education record to user profile
 * @route   POST /api/v1/profile/education
 * @access  Private (JWT Protected)
 */
export const addEducationHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const education = await profileService.addEducation(userId, req.body);
  return new ApiResponse(201, education, 'Education record added successfully').send(res);
});

/**
 * @desc    Get all education records of logged-in user profile
 * @route   GET /api/v1/profile/education
 * @access  Private (JWT Protected)
 */
export const getEducationHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const education = await profileService.getEducation(userId);
  return new ApiResponse(200, education, 'Education records retrieved successfully').send(res);
});

/**
 * @desc    Update an existing education record in user profile
 * @route   PUT /api/v1/profile/education/:id
 * @access  Private (JWT Protected)
 */
export const updateEducationHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const educationId = req.params.id;
  const updatedEducation = await profileService.updateEducation(userId, educationId, req.body);
  return new ApiResponse(200, updatedEducation, 'Education record updated successfully').send(res);
});

/**
 * @desc    Delete an education record from user profile
 * @route   DELETE /api/v1/profile/education/:id
 * @access  Private (JWT Protected)
 */
export const deleteEducationHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const educationId = req.params.id;
  await profileService.deleteEducation(userId, educationId);
  return new ApiResponse(200, null, 'Education record deleted successfully').send(res);
});

/* ==========================================================================
   Experience Handlers
   ========================================================================== */

/**
 * @desc    Add a new experience record to user profile
 * @route   POST /api/v1/profile/experience
 * @access  Private (JWT Protected)
 */
export const addExperienceHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const experience = await profileService.addExperience(userId, req.body);
  return new ApiResponse(201, experience, 'Experience record added successfully').send(res);
});

/**
 * @desc    Get all experience records of logged-in user profile
 * @route   GET /api/v1/profile/experience
 * @access  Private (JWT Protected)
 */
export const getExperienceHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const experience = await profileService.getExperience(userId);
  return new ApiResponse(200, experience, 'Experience records retrieved successfully').send(res);
});

/**
 * @desc    Update an existing experience record in user profile
 * @route   PUT /api/v1/profile/experience/:id
 * @access  Private (JWT Protected)
 */
export const updateExperienceHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const experienceId = req.params.id;
  const updatedExperience = await profileService.updateExperience(userId, experienceId, req.body);
  return new ApiResponse(200, updatedExperience, 'Experience record updated successfully').send(res);
});

/**
 * @desc    Delete an experience record from user profile
 * @route   DELETE /api/v1/profile/experience/:id
 * @access  Private (JWT Protected)
 */
export const deleteExperienceHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const experienceId = req.params.id;
  await profileService.deleteExperience(userId, experienceId);
  return new ApiResponse(200, null, 'Experience record deleted successfully').send(res);
});

/**
 * @desc    Delete user profile
 * @route   DELETE /api/v1/profile
 * @access  Private (JWT Protected)
 */
export const deleteProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  await profileService.deleteProfileByUserId(userId);
  return new ApiResponse(200, null, 'Profile deleted successfully').send(res);
});
