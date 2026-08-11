import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getCurrentUser,
} from '../controllers/auth.controller.js';
import {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  validate,
} from '../validations/auth.validation.js';
import authenticate from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

// Public Authentication Endpoints (Protected by authRateLimiter)
router.post('/register', authRateLimiter, registerValidation, validate, register);
router.post('/login', authRateLimiter, loginValidation, validate, login);
router.post('/refresh-token', authRateLimiter, refreshTokenValidation, validate, refreshToken);
router.post('/forgot-password', authRateLimiter, forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password', authRateLimiter, resetPasswordValidation, validate, resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected Authentication Endpoints
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);

export default router;
