import { body, validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Middleware to check express-validator results and throw ApiError if validation fails
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    const firstErrorMessage = errorDetails[0]?.message || 'Validation failed';
    throw ApiError.badRequest(firstErrorMessage, errorDetails);
  }
  next();
};

/**
 * Validation rules for user registration
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
    .withMessage('Invalid user role specified'),
  body('phone').optional().trim(),
];

/**
 * Validation rules for user login
 */
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Validation rules for refreshing token
 */
export const refreshTokenValidation = [
  body('refreshToken')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Refresh token is required if not sent in cookie'),
];

/**
 * Validation rules for changing password
 */
export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),
];

/**
 * Validation rules for updating profile
 */
export const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone').optional().trim(),
  body('profileImage')
    .optional()
    .trim()
    .isURL()
    .withMessage('Profile image must be a valid URL'),
];
