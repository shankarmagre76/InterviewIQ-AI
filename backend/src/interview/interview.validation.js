import { body, param, validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';
import {
  INTERVIEW_TYPES,
  INTERVIEW_DIFFICULTIES,
  INTERVIEW_MODES,
} from './interview.model.js';

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
 * Validation rules for starting a new Interview session
 */
export const startInterviewValidation = [
  body('role')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Role cannot be empty string')
    .isLength({ max: 100 })
    .withMessage('Role name cannot exceed 100 characters'),

  body('company')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('Company must be a valid MongoDB ObjectId'),

  body('interviewType')
    .optional()
    .trim()
    .isIn(INTERVIEW_TYPES)
    .withMessage(`Interview type must be one of: ${INTERVIEW_TYPES.join(', ')}`),

  body('difficulty')
    .optional()
    .trim()
    .isIn(INTERVIEW_DIFFICULTIES)
    .withMessage(`Difficulty level must be one of: ${INTERVIEW_DIFFICULTIES.join(', ')}`),

  body('totalQuestions')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Total questions must be an integer between 1 and 50'),

  body('estimatedDuration')
    .optional()
    .isInt({ min: 1, max: 180 })
    .withMessage('Estimated duration must be an integer between 1 and 180 minutes'),

  body('mode')
    .optional()
    .trim()
    .isIn(INTERVIEW_MODES)
    .withMessage(`Interview mode must be one of: ${INTERVIEW_MODES.join(', ')}`),

  validate,
];

/**
 * Validation rules for Interview ID route parameter
 */
export const interviewIdParamValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Interview ID format'),
  validate,
];

/**
 * Validation rules for Answer submission
 */
export const submitAnswerValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Interview ID format'),

  param('questionId')
    .optional()
    .isMongoId()
    .withMessage('Invalid Question ID format'),

  body('questionId')
    .optional()
    .isMongoId()
    .withMessage('Invalid Question ID format'),

  body('answer')
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Answer text cannot exceed 10,000 characters'),

  body('userAnswer')
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Answer text cannot exceed 10,000 characters'),

  validate,
];

export default {
  validate,
  startInterviewValidation,
  interviewIdParamValidation,
  submitAnswerValidation,
};
