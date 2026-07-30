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

const router = Router();

// Public Authentication Endpoints
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/refresh-token', refreshTokenValidation, validate, refreshToken);
router.post('/forgot-password', forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected Authentication Endpoints
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);

export default router;
