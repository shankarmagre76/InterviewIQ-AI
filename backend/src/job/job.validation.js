import { body, param, validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';
import {
  EMPLOYMENT_TYPES,
  JOB_STATUSES,
  SALARY_PERIODS,
  WORK_MODES,
} from './job.model.js';

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
 * Create Job API Validation Rules
 */
export const createJobValidation = [
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company ID is required')
    .isMongoId()
    .withMessage('Company ID must be a valid MongoDB ObjectId'),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ min: 3, max: 150 })
    .withMessage('Job title must be between 3 and 150 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ min: 20, max: 10000 })
    .withMessage('Job description must be between 20 and 10,000 characters'),

  body('responsibilities')
    .optional()
    .isArray()
    .withMessage('Responsibilities must be an array of strings'),

  body('responsibilities.*')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Responsibility item cannot be empty'),

  body('requiredSkills')
    .isArray({ min: 1 })
    .withMessage('Required skills must be an array containing at least one skill'),

  body('requiredSkills.*')
    .trim()
    .notEmpty()
    .withMessage('Skill items in requiredSkills cannot be empty'),

  body('preferredSkills')
    .optional()
    .isArray()
    .withMessage('Preferred skills must be an array of strings'),

  body('preferredSkills.*')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Skill items in preferredSkills cannot be empty'),

  // Experience Object Validation
  body('experience')
    .notEmpty()
    .withMessage('Experience object is required')
    .isObject()
    .withMessage('Experience must be an object containing minYears and maxYears'),

  body('experience.minYears')
    .notEmpty()
    .withMessage('Minimum experience years is required')
    .isInt({ min: 0, max: 50 })
    .withMessage('Minimum experience years must be an integer between 0 and 50'),

  body('experience.maxYears')
    .notEmpty()
    .withMessage('Maximum experience years is required')
    .isInt({ min: 0, max: 50 })
    .withMessage('Maximum experience years must be an integer between 0 and 50')
    .custom((maxYears, { req }) => {
      const minYears = req.body?.experience?.minYears;
      if (minYears !== undefined && Number(maxYears) < Number(minYears)) {
        throw new Error('Maximum experience years cannot be less than minimum experience years');
      }
      return true;
    }),

  // Salary Object Validation
  body('salary')
    .optional()
    .isObject()
    .withMessage('Salary must be an object'),

  body('salary.min')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Salary minimum cannot be negative'),

  body('salary.max')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Salary maximum cannot be negative')
    .custom((maxSalary, { req }) => {
      const minSalary = req.body?.salary?.min;
      const isDisclosed = req.body?.salary?.isDisclosed !== false;
      if (
        isDisclosed &&
        minSalary !== undefined &&
        minSalary > 0 &&
        maxSalary > 0 &&
        Number(maxSalary) < Number(minSalary)
      ) {
        throw new Error('Maximum salary cannot be less than minimum salary');
      }
      return true;
    }),

  body('salary.currency')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency code must be exactly 3 characters (e.g. USD, EUR, INR)'),

  body('salary.period')
    .optional()
    .trim()
    .isIn(SALARY_PERIODS)
    .withMessage(`Salary period must be one of: ${SALARY_PERIODS.join(', ')}`),

  body('salary.isDisclosed')
    .optional()
    .isBoolean()
    .withMessage('isDisclosed must be a boolean value'),

  // General Job Details Validation
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ max: 150 })
    .withMessage('Location cannot exceed 150 characters'),

  body('workMode')
    .trim()
    .notEmpty()
    .withMessage('Work mode is required')
    .isIn(WORK_MODES)
    .withMessage(`Work mode must be one of: ${WORK_MODES.join(', ')}`),

  body('employmentType')
    .trim()
    .notEmpty()
    .withMessage('Employment type is required')
    .isIn(EMPLOYMENT_TYPES)
    .withMessage(`Employment type must be one of: ${EMPLOYMENT_TYPES.join(', ')}`),

  body('openings')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Openings count must be an integer of at least 1'),

  body('applicationDeadline')
    .notEmpty()
    .withMessage('Application deadline date is required')
    .isISO8601()
    .withMessage('Application deadline must be a valid ISO8601 date string')
    .custom((deadlineStr) => {
      const deadline = new Date(deadlineStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadline < today) {
        throw new Error('Application deadline date cannot be in the past');
      }
      return true;
    }),

  body('status')
    .optional()
    .trim()
    .isIn(JOB_STATUSES)
    .withMessage(`Job status must be one of: ${JOB_STATUSES.join(', ')}`),

  body('createdBy')
    .optional()
    .isMongoId()
    .withMessage('Created by must be a valid user ID'),
];

/**
 * Update Job API Validation Rules
 */
export const updateJobValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid job ID format'),

  body('company')
    .optional()
    .trim()
    .isMongoId()
    .withMessage('Company ID must be a valid MongoDB ObjectId'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('Job title must be between 3 and 150 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 10000 })
    .withMessage('Job description must be between 20 and 10,000 characters'),

  body('responsibilities')
    .optional()
    .isArray()
    .withMessage('Responsibilities must be an array of strings'),

  body('requiredSkills')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Required skills must be an array containing at least one skill'),

  body('preferredSkills')
    .optional()
    .isArray()
    .withMessage('Preferred skills must be an array of strings'),

  body('experience')
    .optional()
    .isObject()
    .withMessage('Experience must be an object'),

  body('experience.minYears')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Minimum experience years must be an integer between 0 and 50'),

  body('experience.maxYears')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Maximum experience years must be an integer between 0 and 50')
    .custom((maxYears, { req }) => {
      const minYears = req.body?.experience?.minYears;
      if (minYears !== undefined && Number(maxYears) < Number(minYears)) {
        throw new Error('Maximum experience years cannot be less than minimum experience years');
      }
      return true;
    }),

  body('salary')
    .optional()
    .isObject()
    .withMessage('Salary must be an object'),

  body('salary.min')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Salary minimum cannot be negative'),

  body('salary.max')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Salary maximum cannot be negative')
    .custom((maxSalary, { req }) => {
      const minSalary = req.body?.salary?.min;
      if (minSalary !== undefined && minSalary > 0 && maxSalary > 0 && Number(maxSalary) < Number(minSalary)) {
        throw new Error('Maximum salary cannot be less than minimum salary');
      }
      return true;
    }),

  body('salary.currency')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency code must be exactly 3 characters'),

  body('salary.period')
    .optional()
    .trim()
    .isIn(SALARY_PERIODS)
    .withMessage(`Salary period must be one of: ${SALARY_PERIODS.join(', ')}`),

  body('salary.isDisclosed')
    .optional()
    .isBoolean()
    .withMessage('isDisclosed must be a boolean value'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Location cannot exceed 150 characters'),

  body('workMode')
    .optional()
    .trim()
    .isIn(WORK_MODES)
    .withMessage(`Work mode must be one of: ${WORK_MODES.join(', ')}`),

  body('employmentType')
    .optional()
    .trim()
    .isIn(EMPLOYMENT_TYPES)
    .withMessage(`Employment type must be one of: ${EMPLOYMENT_TYPES.join(', ')}`),

  body('openings')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Openings count must be an integer of at least 1'),

  body('applicationDeadline')
    .optional()
    .isISO8601()
    .withMessage('Application deadline must be a valid ISO8601 date string'),

  body('status')
    .optional()
    .trim()
    .isIn(JOB_STATUSES)
    .withMessage(`Job status must be one of: ${JOB_STATUSES.join(', ')}`),
];

/**
 * Job ID Parameter Validation Rule
 */
export const jobIdParamValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid job ID format'),
];

export default {
  validate,
  createJobValidation,
  updateJobValidation,
  jobIdParamValidation,
};
