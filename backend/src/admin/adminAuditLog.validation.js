import { param, query, validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';
import { AUDIT_ACTIONS, AUDIT_TARGET_TYPES } from './adminAuditLog.model.js';

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
 * Audit Log ID Parameter Validation Rule
 */
export const auditLogIdParamValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Audit Log ID format'),
  validate,
];

/**
 * Audit Log Query Parameter Validation Rules
 */
export const adminAuditLogQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be an integer greater than or equal to 1'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100'),

  query('action')
    .optional()
    .trim()
    .isIn(AUDIT_ACTIONS)
    .withMessage(`action must be one of: ${AUDIT_ACTIONS.join(', ')}`),

  query('targetType')
    .optional()
    .trim()
    .isIn(AUDIT_TARGET_TYPES)
    .withMessage(`targetType must be one of: ${AUDIT_TARGET_TYPES.join(', ')}`),

  query('admin')
    .optional()
    .isMongoId()
    .withMessage('admin must be a valid MongoDB ObjectId'),

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
  auditLogIdParamValidation,
  adminAuditLogQueryValidation,
};
