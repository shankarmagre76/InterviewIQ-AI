import profileService from './profile.service.js';
import ApiResponse from '../utils/ApiResponse.js';
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
 * @desc    Update user profile
 * @route   PUT /api/v1/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const updatedProfile = await profileService.updateProfileByUserId(userId, req.body);
  return new ApiResponse(200, updatedProfile, 'Profile updated successfully').send(res);
});

/**
 * @desc    Delete user profile
 * @route   DELETE /api/v1/profile
 * @access  Private
 */
export const deleteProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  await profileService.deleteProfileByUserId(userId);
  return new ApiResponse(200, null, 'Profile deleted successfully').send(res);
});
