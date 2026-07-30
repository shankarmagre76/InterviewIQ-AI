import authService from './auth.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../middleware/async.middleware.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);

  res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 24 * 60 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

  return new ApiResponse(
    201,
    { user, accessToken, refreshToken },
    'User registered successfully'
  ).send(res);
});

/**
 * @desc    Authenticate user & get tokens
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 24 * 60 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

  return new ApiResponse(
    200,
    { user, accessToken, refreshToken },
    'Login successful'
  ).send(res);
});

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  const tokens = await authService.refreshToken(token);

  res.cookie('accessToken', tokens.accessToken, { ...COOKIE_OPTIONS, maxAge: 24 * 60 * 60 * 1000 });
  res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);

  return new ApiResponse(
    200,
    tokens,
    'Token refreshed successfully'
  ).send(res);
});

/**
 * @desc    Logout user & clear tokens
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  if (req.user?.id) {
    await authService.logout(req.user.id);
  }

  res.clearCookie('accessToken', COOKIE_OPTIONS);
  res.clearCookie('refreshToken', COOKIE_OPTIONS);

  return new ApiResponse(200, null, 'Logged out successfully').send(res);
});

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  const profile = await authService.getUserProfile(req.user.id);
  return new ApiResponse(200, profile, 'User profile retrieved successfully').send(res);
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/auth/me
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const updatedProfile = await authService.updateUserProfile(req.user.id, req.body);
  return new ApiResponse(200, updatedProfile, 'Profile updated successfully').send(res);
});

/**
 * @desc    Change password
 * @route   POST /api/v1/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, currentPassword, newPassword);

  return new ApiResponse(200, null, 'Password updated successfully').send(res);
});
