import { param, query, validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';
import { APPLICATION_STATUSES } from '../application/application.model.js';

/**
 * Universal Validation Result Middleware
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
 * Application ID Parameter Validation Rule
 */
export const applicationIdParamValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Application ID format'),
  validate,
];

/**
 * Query Validation for Application Monitoring and Statistics
 */
export const adminApplicationQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be an integer greater than or equal to 1'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100'),

  query('status')
    .optional()
    .trim()
    .isIn(APPLICATION_STATUSES)
    .withMessage(`status must be one of: ${APPLICATION_STATUSES.join(', ')}`),

  query('company')
    .optional()
    .isMongoId()
    .withMessage('company must be a valid MongoDB ObjectId'),

  query('job')
    .optional()
    .isMongoId()
    .withMessage('job must be a valid MongoDB ObjectId'),

  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('dateFrom must be a valid ISO8601 date string'),

  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('dateTo must be a valid ISO8601 date string'),

  validate,
];

export default {
  validate,
  applicationIdParamValidation,
  adminApplicationQueryValidation,
};
