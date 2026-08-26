import { body, param, validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

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

export const saveJobValidation = [
  body('job')
    .optional()
    .trim()
    .isMongoId()
    .withMessage('Job ID must be a valid MongoDB ObjectId'),

  body('jobId')
    .optional()
    .trim()
    .isMongoId()
    .withMessage('Job ID must be a valid MongoDB ObjectId'),

  body('user')
    .optional()
    .trim()
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),

  body().custom((_value, { req }) => {
    if (!req?.body?.job && !req?.body?.jobId) {
      throw new Error('Job ID is required');
    }
    return true;
  }),
];

/**
 * Saved Job ID / Job ID Parameter Validation Rule
 */
export const savedJobParamValidation = [
  param('jobId')
    .isMongoId()
    .withMessage('Invalid job ID format'),
];

export default {
  validate,
  saveJobValidation,
  savedJobParamValidation,
};
