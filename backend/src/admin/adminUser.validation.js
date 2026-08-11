import { body, param, query, validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

const ALLOWED_ROLES_LOWER = ['student', 'recruiter', 'admin', 'candidate', 'interviewer'];
const ALLOWED_STATUS_VALUES = ['active', 'deactivated', 'inactive', 'true', 'false'];

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
 * Validation rules for User ID URL Parameter
 */
export const userIdParamValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid User ID format'),
  validate,
];

/**
 * Validation rules for Query Parameters (list/search/filter users)
 */
export const userQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be an integer greater than or equal to 1'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100'),

  query('role')
    .optional()
    .trim()
    .custom((val) => {
      if (!val) return true;
      if (ALLOWED_ROLES_LOWER.includes(String(val).toLowerCase())) return true;
      throw new Error(`Invalid role filter '${val}'. Allowed roles: Student, Recruiter, Admin`);
    }),

  query('status')
    .optional()
    .trim()
    .custom((val) => {
      if (!val) return true;
      if (ALLOWED_STATUS_VALUES.includes(String(val).toLowerCase())) return true;
      throw new Error(`Invalid status filter '${val}'. Allowed values: active, deactivated`);
    }),

  query('sortBy')
    .optional()
    .trim()
    .isIn(['createdAt', 'firstName', 'lastName', 'email', 'role', 'isActive'])
    .withMessage('sortBy must be one of: createdAt, firstName, lastName, email, role, isActive'),

  query('sortOrder')
    .optional()
    .trim()
    .isIn(['asc', 'desc', '1', '-1'])
    .withMessage('sortOrder must be asc, desc, 1, or -1'),

  validate,
];

/**
 * Validation rules for Status update request body
 */
export const updateStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid User ID format'),

  body()
    .custom((reqBody) => {
      if (reqBody.isActive === undefined && reqBody.status === undefined) {
        throw new Error('Either isActive (boolean) or status (string) must be provided');
      }
      if (reqBody.isActive !== undefined && typeof reqBody.isActive !== 'boolean') {
        throw new Error('isActive must be a boolean value (true or false)');
      }
      if (reqBody.status !== undefined) {
        const valStr = String(reqBody.status).trim().toLowerCase();
        if (!ALLOWED_STATUS_VALUES.includes(valStr)) {
          throw new Error('status must be one of: active, deactivated');
        }
      }
      return true;
    }),

  validate,
];

/**
 * Validation rules for Role update request body
 */
export const updateRoleValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid User ID format'),

  body('role')
    .exists()
    .withMessage('role field is required')
    .trim()
    .custom((val) => {
      if (ALLOWED_ROLES_LOWER.includes(String(val).toLowerCase())) return true;
      throw new Error(`Invalid role '${val}'. Allowed roles: Student, Recruiter, Admin`);
    }),

  validate,
];

export default {
  validate,
  userIdParamValidation,
  userQueryValidation,
  updateStatusValidation,
  updateRoleValidation,
};
