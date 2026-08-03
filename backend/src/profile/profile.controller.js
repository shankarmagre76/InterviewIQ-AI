import profileService from './profile.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../middleware/async.middleware.js';

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  // Controller stub - business logic to be implemented
  const profile = await profileService.getProfileByUserId(req.user?.id);
  return new ApiResponse(200, profile, 'Profile retrieved successfully').send(res);
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  // Controller stub - business logic to be implemented
  const updatedProfile = await profileService.updateProfileByUserId(req.user?.id, req.body);
  return new ApiResponse(200, updatedProfile, 'Profile updated successfully').send(res);
});

/**
 * @desc    Delete user profile
 * @route   DELETE /api/v1/profile
 * @access  Private
 */
export const deleteProfile = asyncHandler(async (req, res) => {
  // Controller stub - business logic to be implemented
  await profileService.deleteProfileByUserId(req.user?.id);
  return new ApiResponse(200, null, 'Profile deleted successfully').send(res);
});
