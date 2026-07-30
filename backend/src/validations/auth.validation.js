import { body, validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Validation Result Middleware
 * Formats express-validator error array and throws ApiError if errors exist.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    const primaryMessage = formattedErrors[0]?.message || 'Validation failed';
    throw ApiError.badRequest(primaryMessage, formattedErrors);
  }
  next();
};

/**
 * Register Validation Rules
 */
export const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['Student', 'Recruiter', 'Admin'])
    .withMessage('Role must be one of: Student, Recruiter, Admin'),
  body('phone')
    .optional()
    .trim(),
];

/**
 * Login Validation Rules
 */
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Refresh Token Validation Rules
 */
export const refreshTokenValidation = [
  body('refreshToken')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Refresh token is required if not sent in cookies'),
];

/**
 * Forgot Password Validation Rules
 */
export const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

/**
 * Reset Password Validation Rules
 */
export const resetPasswordValidation = [
  body('token')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
];
