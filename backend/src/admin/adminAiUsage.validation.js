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
 * Query Validation Rules for AI Usage Telemetry APIs
 */
export const adminAiQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be an integer greater than or equal to 1'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100'),

  query('user')
    .optional()
    .isMongoId()
    .withMessage('user must be a valid MongoDB ObjectId'),

  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('dateFrom must be a valid ISO8601 date string'),

  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('dateTo must be a valid ISO8601 date string'),

  query('status')
    .optional()
    .trim(),

  query('type')
    .optional()
    .trim(),

  query('difficulty')
    .optional()
    .trim(),

  validate,
];

export default {
  validate,
  adminAiQueryValidation,
};
