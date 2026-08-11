import { body, param, query } from 'express-validator';
import {
  validate,
  createCompanyValidation,
  updateCompanyValidation,
  companyIdParamValidation,
} from '../company/company.validation.js';
import { HIRING_STATUSES, INDUSTRIES } from '../company/company.model.js';

/**
 * Admin Company Query Validation
 */
export const adminCompanyQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be an integer greater than or equal to 1'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100'),

  query('industry')
    .optional()
    .trim()
    .isIn(INDUSTRIES)
    .withMessage(`industry must be one of: ${INDUSTRIES.join(', ')}`),

  query('hiringStatus')
    .optional()
    .trim()
    .isIn(HIRING_STATUSES)
    .withMessage(`hiringStatus must be one of: ${HIRING_STATUSES.join(', ')}`),

  validate,
];

/**
 * Admin Company Status Update Body Validation
 */
export const adminCompanyStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid company ID format'),

  body()
    .custom((reqBody) => {
      const statusVal = reqBody.hiringStatus || reqBody.status;
      if (statusVal === undefined && reqBody.isActive === undefined) {
        throw new Error('Either hiringStatus (string) or isActive (boolean) must be provided');
      }
      if (statusVal !== undefined && !HIRING_STATUSES.includes(statusVal)) {
        throw new Error(`hiringStatus must be one of: ${HIRING_STATUSES.join(', ')}`);
      }
      return true;
    }),

  validate,
];

export {
  validate,
  createCompanyValidation,
  updateCompanyValidation,
  companyIdParamValidation,
};
