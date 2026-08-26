import { body, param, query, validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';
import { ROADMAP_STATUSES } from './learningRoadmap.model.js';
import {
  TASK_TYPES,
  TASK_STATUSES,
  TASK_PRIORITIES,
} from './learningTask.model.js';

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
 * Validation rules for Roadmap Generation request
 */
export const generateRoadmapValidation = [
  body('targetRole')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Target role cannot exceed 100 characters'),

  body('forceRegenerate')
    .optional()
    .isBoolean()
    .withMessage('forceRegenerate must be a boolean value'),

  validate,
];

/**
 * Validation rules for Roadmap ID URL parameter
 */
export const roadmapIdParamValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Learning Roadmap ID format'),
  validate,
];

/**
 * Validation rules for Task ID URL parameter
 */
export const taskIdParamValidation = [
  param('taskId')
    .isMongoId()
    .withMessage('Invalid Learning Task ID format'),
  validate,
];

/**
 * Validation rules for Roadmap update body
 */
export const updateRoadmapValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Learning Roadmap ID format'),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Roadmap title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Roadmap title cannot exceed 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Roadmap description cannot exceed 2000 characters'),

  body('status')
    .optional()
    .trim()
    .isIn(ROADMAP_STATUSES)
    .withMessage(`Status must be one of: ${ROADMAP_STATUSES.join(', ')}`),

  validate,
];

/**
 * Validation rules for Task update body
 */
export const updateTaskValidation = [
  param('taskId')
    .isMongoId()
    .withMessage('Invalid Learning Task ID format'),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Task title cannot exceed 200 characters'),

  body('type')
    .optional()
    .trim()
    .isIn(TASK_TYPES)
    .withMessage(`Task type must be one of: ${TASK_TYPES.join(', ')}`),

  body('priority')
    .optional()
    .trim()
    .isIn(TASK_PRIORITIES)
    .withMessage(`Task priority must be one of: ${TASK_PRIORITIES.join(', ')}`),

  body('status')
    .optional()
    .trim()
    .isIn(TASK_STATUSES)
    .withMessage(`Task status must be one of: ${TASK_STATUSES.join(', ')}`),

  body('estimatedMinutes')
    .optional()
    .isInt({ min: 1, max: 1440 })
    .withMessage('Estimated minutes must be an integer between 1 and 1440'),

  validate,
];

/**
 * Validation rules for Roadmap history query parameters
 */
export const roadmapHistoryValidation = [
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
    .isIn(ROADMAP_STATUSES)
    .withMessage(`status must be one of: ${ROADMAP_STATUSES.join(', ')}`),

  validate,
];

export default {
  validate,
  generateRoadmapValidation,
  roadmapIdParamValidation,
  taskIdParamValidation,
  updateRoadmapValidation,
  updateTaskValidation,
  roadmapHistoryValidation,
};
