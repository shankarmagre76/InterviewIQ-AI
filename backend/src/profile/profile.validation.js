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
 * Validation rules for updating user profile
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
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other', 'Prefer not to say', ''])
    .withMessage('Invalid gender choice'),
  body('dateOfBirth')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Please provide a valid ISO8601 date of birth (YYYY-MM-DD)'),
  body('headline')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Headline cannot exceed 100 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('website')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  body('currentLocation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Current location cannot exceed 100 characters'),
  body('preferredLocation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Preferred location cannot exceed 100 characters'),
];
