import authService from '../services/auth.service.js';
import asyncHandler from '../middleware/async.middleware.js';
import ApiResponse from '../utils/ApiResponse.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

/**
 * @desc    Register a new user account
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);

  res.cookie('accessToken', result.accessToken, { ...COOKIE_OPTIONS, maxAge: 24 * 60 * 60 * 1000 });
  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

  return new ApiResponse(201, result, 'User registered successfully').send(res);
});

/**
 * @desc    Authenticate user & get tokens
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);

  res.cookie('accessToken', result.accessToken, { ...COOKIE_OPTIONS, maxAge: 24 * 60 * 60 * 1000 });
  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

  return new ApiResponse(200, result, 'Login successful').send(res);
});

/**
 * @desc    Logout user & clear session
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (userId) {
    await authService.logoutUser(userId);
  }

  res.clearCookie('accessToken', COOKIE_OPTIONS);
  res.clearCookie('refreshToken', COOKIE_OPTIONS);

  return new ApiResponse(200, null, 'Logged out successfully').send(res);
});

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.body?.refreshToken || req.cookies?.refreshToken;
  const result = await authService.refreshAccessToken(token);

  res.cookie('accessToken', result.accessToken, { ...COOKIE_OPTIONS, maxAge: 24 * 60 * 60 * 1000 });
  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

  return new ApiResponse(200, result, 'Token refreshed successfully').send(res);
});

/**
 * @desc    Send password reset email link
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  return new ApiResponse(200, result, 'Password reset email sent successfully').send(res);
});

/**
 * @desc    Reset user password using token
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const token = req.body.token || req.query.token;
  const { newPassword } = req.body;
  const result = await authService.resetPassword(token, newPassword);
  return new ApiResponse(200, result, 'Password has been reset successfully').send(res);
});

/**
 * @desc    Verify user email address via token
 * @route   GET /api/v1/auth/verify-email/:token
 * @access  Public
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.params.token || req.query.token;
  const result = await authService.verifyEmail(token);
  return new ApiResponse(200, result, 'Email address verified successfully').send(res);
});

/**
 * @desc    Get currently logged-in user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const profile = await authService.getUserProfile(userId);
  return new ApiResponse(200, profile, 'User profile retrieved successfully').send(res);
});
