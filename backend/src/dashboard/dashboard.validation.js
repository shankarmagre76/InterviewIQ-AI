import { query, validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Express Validator Error Sanitizer Middleware
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
 * Validation rules for Analytics query parameters (optional date range)
 */
export const analyticsQueryValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate must be a valid ISO 8601 date string (e.g. YYYY-MM-DD)'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate must be a valid ISO 8601 date string (e.g. YYYY-MM-DD)')
    .custom((endDate, { req }) => {
      if (req.query.startDate && endDate) {
        if (new Date(endDate) < new Date(req.query.startDate)) {
          throw new Error('endDate cannot be earlier than startDate');
        }
      }
      return true;
    }),

  validate,
];

/**
 * Validation rules for Activity feed query parameters
 */
export const activityQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be an integer greater than or equal to 1'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100'),

  query('type')
    .optional()
    .trim()
    .toUpperCase()
    .isIn([
      'RESUME_UPLOAD',
      'RESUME_ANALYSIS',
      'INTERVIEW_STARTED',
      'INTERVIEW_COMPLETED',
      'APPLICATION_SUBMITTED',
      'JOB_SAVED',
    ])
    .withMessage(
      'type must be one of: RESUME_UPLOAD, RESUME_ANALYSIS, INTERVIEW_STARTED, INTERVIEW_COMPLETED, APPLICATION_SUBMITTED, JOB_SAVED'
    ),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate must be a valid ISO 8601 date string'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate must be a valid ISO 8601 date string'),

  validate,
];

export default {
  validate,
  analyticsQueryValidation,
  activityQueryValidation,
};
