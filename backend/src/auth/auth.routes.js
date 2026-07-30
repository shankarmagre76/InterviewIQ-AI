import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword,
} from './auth.controller.js';
import {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  changePasswordValidation,
  updateProfileValidation,
  validate,
} from './auth.validation.js';
import authenticate from '../middleware/auth.middleware.js';

const router = Router();

// Public auth endpoints
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/refresh-token', refreshTokenValidation, validate, refreshToken);

// Protected auth endpoints (requires valid JWT)
router.use(authenticate);

router.post('/logout', logout);
router.get('/me', getProfile);
router.put('/me', updateProfileValidation, validate, updateProfile);
router.post('/change-password', changePasswordValidation, validate, changePassword);

export default router;
