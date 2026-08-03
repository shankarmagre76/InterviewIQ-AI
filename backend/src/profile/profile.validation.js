import { body, param, validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Reusable middleware to process express-validator errors.
 * Extracts field-level validation errors and throws a standardized ApiError.badRequest.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    const firstErrorMessage = errorDetails[0]?.message || 'Validation failed';
    throw ApiError.badRequest(firstErrorMessage, errorDetails);
  }
  next();
};

/**
 * Validation & Sanitization rules for creating a user profile
 */
export const createProfileValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('gender')
    .optional({ checkFalsy: true })
    .trim()
    .isIn(['Male', 'Female', 'Other', 'Prefer not to say', ''])
    .withMessage('Invalid gender selection'),
  body('dateOfBirth')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Please provide a valid ISO8601 date of birth (YYYY-MM-DD)')
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('Date of birth cannot be in the future');
      }
      return true;
    }),
  body('headline')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Headline cannot exceed 100 characters'),
  body('bio')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('website')
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Website must be a valid HTTP/HTTPS URL'),
  body('profileImage')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Profile image must be a valid URL'),
  body('currentLocation')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Current location cannot exceed 100 characters'),
  body('preferredLocation')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Preferred location cannot exceed 100 characters'),
];

/**
 * Validation & Sanitization rules for updating user profile
 */
export const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('gender')
    .optional({ checkFalsy: true })
    .trim()
    .isIn(['Male', 'Female', 'Other', 'Prefer not to say', ''])
    .withMessage('Invalid gender selection'),
  body('dateOfBirth')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Please provide a valid ISO8601 date of birth (YYYY-MM-DD)')
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('Date of birth cannot be in the future');
      }
      return true;
    }),
  body('headline')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Headline cannot exceed 100 characters'),
  body('bio')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('website')
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Website must be a valid HTTP/HTTPS URL'),
  body('profileImage')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Profile image must be a valid URL'),
  body('currentLocation')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Current location cannot exceed 100 characters'),
  body('preferredLocation')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Preferred location cannot exceed 100 characters'),
];

/**
 * Validation rules for adding a skill to profile
 */
export const addSkillValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Skill name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Skill name must be between 1 and 50 characters'),
  body('level')
    .optional({ checkFalsy: true })
    .trim()
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Skill level must be one of: Beginner, Intermediate, Advanced'),
];

/**
 * Validation rules for updating a skill in profile
 */
export const updateSkillValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid skill ID format'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Skill name cannot be empty')
    .isLength({ min: 1, max: 50 })
    .withMessage('Skill name must be between 1 and 50 characters'),
  body('level')
    .optional()
    .trim()
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Skill level must be one of: Beginner, Intermediate, Advanced'),
];

/**
 * Validation rules for skill ID URL parameter
 */
export const skillIdParamValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid skill ID format'),
];
