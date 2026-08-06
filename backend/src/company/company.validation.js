import { body, param, validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';
import { COMPANY_SIZES, HIRING_STATUSES, INDUSTRIES } from './company.model.js';

/**
 * Universal Validation Result Middleware
 * Inspects express-validator rules result and throws ApiError if errors exist.
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
 * Create Company API Validation Rules
 */
export const createCompanyValidation = [
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),

  body('companyLogo')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Company logo must be a valid URL'),

  body('website')
    .trim()
    .notEmpty()
    .withMessage('Company website URL is required')
    .isURL()
    .withMessage('Please provide a valid website URL'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Company description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Company description must be between 10 and 2000 characters'),

  body('industry')
    .trim()
    .notEmpty()
    .withMessage('Industry is required')
    .isIn(INDUSTRIES)
    .withMessage(`Industry must be one of: ${INDUSTRIES.join(', ')}`),

  body('headquarters')
    .trim()
    .notEmpty()
    .withMessage('Headquarters location is required')
    .isLength({ max: 150 })
    .withMessage('Headquarters location cannot exceed 150 characters'),

  body('locations')
    .optional()
    .isArray()
    .withMessage('Locations must be an array of strings'),

  body('locations.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each location must be between 1 and 100 characters'),

  body('companySize')
    .trim()
    .notEmpty()
    .withMessage('Company size is required')
    .isIn(COMPANY_SIZES)
    .withMessage(`Company size must be one of: ${COMPANY_SIZES.join(', ')}`),

  body('foundedYear')
    .notEmpty()
    .withMessage('Founded year is required')
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage(`Founded year must be an integer between 1800 and ${new Date().getFullYear()}`),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Company contact email is required')
    .isEmail()
    .withMessage('Please provide a valid contact email address')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),

  body('socialLinks')
    .optional()
    .isObject()
    .withMessage('Social links must be an object'),

  body('socialLinks.linkedin')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('LinkedIn link must be a valid URL'),

  body('socialLinks.twitter')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Twitter link must be a valid URL'),

  body('socialLinks.facebook')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Facebook link must be a valid URL'),

  body('socialLinks.glassdoor')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Glassdoor link must be a valid URL'),

  body('socialLinks.github')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('GitHub link must be a valid URL'),

  body('hiringStatus')
    .optional()
    .trim()
    .isIn(HIRING_STATUSES)
    .withMessage(`Hiring status must be one of: ${HIRING_STATUSES.join(', ')}`),

  body('createdBy')
    .optional()
    .isMongoId()
    .withMessage('Created by must be a valid user ID'),
];

/**
 * Update Company API Validation Rules
 */
export const updateCompanyValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid company ID format'),

  body('companyName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),

  body('companyLogo')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Company logo must be a valid URL'),

  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid website URL'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Company description must be between 10 and 2000 characters'),

  body('industry')
    .optional()
    .trim()
    .isIn(INDUSTRIES)
    .withMessage(`Industry must be one of: ${INDUSTRIES.join(', ')}`),

  body('headquarters')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Headquarters location cannot exceed 150 characters'),

  body('locations')
    .optional()
    .isArray()
    .withMessage('Locations must be an array of strings'),

  body('locations.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each location must be between 1 and 100 characters'),

  body('companySize')
    .optional()
    .trim()
    .isIn(COMPANY_SIZES)
    .withMessage(`Company size must be one of: ${COMPANY_SIZES.join(', ')}`),

  body('foundedYear')
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage(`Founded year must be an integer between 1800 and ${new Date().getFullYear()}`),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid contact email address')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),

  body('socialLinks')
    .optional()
    .isObject()
    .withMessage('Social links must be an object'),

  body('socialLinks.linkedin')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('LinkedIn link must be a valid URL'),

  body('socialLinks.twitter')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Twitter link must be a valid URL'),

  body('socialLinks.facebook')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Facebook link must be a valid URL'),

  body('socialLinks.glassdoor')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Glassdoor link must be a valid URL'),

  body('socialLinks.github')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('GitHub link must be a valid URL'),

  body('hiringStatus')
    .optional()
    .trim()
    .isIn(HIRING_STATUSES)
    .withMessage(`Hiring status must be one of: ${HIRING_STATUSES.join(', ')}`),
];

/**
 * Company ID Parameter Validation Rule
 */
export const companyIdParamValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid company ID format'),
];

export default {
  validate,
  createCompanyValidation,
  updateCompanyValidation,
  companyIdParamValidation,
};
