import { param, query, validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';
import { NOTIFICATION_TYPES } from './notification.model.js';

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
 * Validation rules for Notification ID URL parameter
 */
export const notificationIdParamValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Notification ID format'),
  validate,
];

/**
 * Validation rules for Notification query parameters
 */
export const notificationQueryValidation = [
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
    .isIn(NOTIFICATION_TYPES)
    .withMessage(`type must be one of: ${NOTIFICATION_TYPES.join(', ')}`),

  query('isRead')
    .optional()
    .isBoolean()
    .withMessage('isRead must be a boolean value'),

  validate,
];

export default {
  validate,
  notificationIdParamValidation,
  notificationQueryValidation,
};
