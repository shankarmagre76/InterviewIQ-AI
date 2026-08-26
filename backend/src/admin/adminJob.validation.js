import { body, param, query } from 'express-validator';
import {
  validate,
  createJobValidation,
  updateJobValidation,
  jobIdParamValidation,
} from '../job/job.validation.js';
import { JOB_STATUSES, WORK_MODES, EMPLOYMENT_TYPES } from '../job/job.model.js';

/**
 * Admin Job Query Parameter Validation Rules
 */
export const adminJobQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be an integer greater than or equal to 1'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100'),

  query('company')
    .optional()
    .isMongoId()
    .withMessage('company must be a valid MongoDB ObjectId'),

  query('status')
    .optional()
    .trim()
    .isIn(JOB_STATUSES)
    .withMessage(`status must be one of: ${JOB_STATUSES.join(', ')}`),

  query('workMode')
    .optional()
    .trim(),

  query('employmentType')
    .optional()
    .trim(),

  validate,
];

/**
 * Admin Job Status Update Body Validation Rules
 */
export const adminJobStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid job ID format'),

  body()
    .custom((reqBody) => {
      const statusVal = reqBody.status;
      if (statusVal === undefined && reqBody.isActive === undefined) {
        throw new Error('Either status (string) or isActive (boolean) must be provided');
      }
      if (statusVal !== undefined && !JOB_STATUSES.includes(statusVal)) {
        throw new Error(`status must be one of: ${JOB_STATUSES.join(', ')}`);
      }
      return true;
    }),

  validate,
];

export {
  validate,
  createJobValidation,
  updateJobValidation,
  jobIdParamValidation,
};
