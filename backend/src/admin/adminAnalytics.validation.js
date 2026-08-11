import { query, validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

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
 * Analytics Query Parameter Validation Rules
 */
export const adminAnalyticsQueryValidation = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('days must be an integer between 1 and 365'),

  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('dateFrom must be a valid ISO8601 date string'),

  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('dateTo must be a valid ISO8601 date string'),

  query('company')
    .optional()
    .isMongoId()
    .withMessage('company must be a valid MongoDB ObjectId'),

  query('job')
    .optional()
    .isMongoId()
    .withMessage('job must be a valid MongoDB ObjectId'),

  query('user')
    .optional()
    .isMongoId()
    .withMessage('user must be a valid MongoDB ObjectId'),

  validate,
];

export default {
  validate,
  adminAnalyticsQueryValidation,
};
