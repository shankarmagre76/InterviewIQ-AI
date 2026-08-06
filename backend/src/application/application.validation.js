import { body, param, validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';
import { APPLICATION_STATUSES } from './application.model.js';

/**
 * Universal Validation Result Handler Middleware
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
 * Create Application Validation Rules
 */
export const createApplicationValidation = [
  body('job')
    .trim()
    .notEmpty()
    .withMessage('Job ID is required')
    .isMongoId()
    .withMessage('Job ID must be a valid MongoDB ObjectId'),

  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company ID is required')
    .isMongoId()
    .withMessage('Company ID must be a valid MongoDB ObjectId'),

  body('resume')
    .trim()
    .notEmpty()
    .withMessage('Resume ID is required')
    .isMongoId()
    .withMessage('Resume ID must be a valid MongoDB ObjectId'),

  body('user')
    .optional()
    .trim()
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),

  body('coverLetter')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Cover letter cannot exceed 5000 characters'),
];

/**
 * Update Application Status Validation Rules
 */
export const updateApplicationStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid application ID format'),

  body('status')
    .optional()
    .trim()
    .isIn(APPLICATION_STATUSES)
    .withMessage(`Status must be one of: ${APPLICATION_STATUSES.join(', ')}`),

  body('interviewDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Interview date must be a valid ISO8601 date string'),

  body('recruiterNotes')
    .optional()
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Recruiter notes cannot exceed 3000 characters'),

  body('feedback')
    .optional()
    .isObject()
    .withMessage('Feedback must be an object'),

  body('feedback.comments')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Feedback comments cannot exceed 2000 characters'),

  body('feedback.rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Feedback rating must be an integer between 1 and 5'),
];

/**
 * Application ID Parameter Validation Rule
 */
export const applicationIdParamValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid application ID format'),
];

export default {
  validate,
  createApplicationValidation,
  updateApplicationStatusValidation,
  applicationIdParamValidation,
};
