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
