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

/**
 * Validation rules for adding an education record to profile
 */
export const addEducationValidation = [
  body('institute')
    .trim()
    .notEmpty()
    .withMessage('Institute name is required')
    .isLength({ max: 100 })
    .withMessage('Institute name cannot exceed 100 characters'),
  body('degree')
    .trim()
    .notEmpty()
    .withMessage('Degree is required')
    .isLength({ max: 100 })
    .withMessage('Degree cannot exceed 100 characters'),
  body('branch')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Branch cannot exceed 100 characters'),
  body('cgpa')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0, max: 100 })
    .withMessage('CGPA / Grade must be a number between 0 and 100'),
  body('startYear')
    .notEmpty()
    .withMessage('Start year is required')
    .isInt({ min: 1950, max: 2100 })
    .withMessage('Start year must be a valid year between 1950 and 2100'),
  body('endYear')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1950, max: 2100 })
    .withMessage('End year must be a valid year between 1950 and 2100')
    .custom((value, { req }) => {
      if (value && req.body.startYear && Number(value) < Number(req.body.startYear)) {
        throw new Error('End year cannot be prior to start year');
      }
      return true;
    }),
  body('current')
    .optional()
    .isBoolean()
    .withMessage('Current status must be a boolean value'),
];

/**
 * Validation rules for updating an education record in profile
 */
export const updateEducationValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid education ID format'),
  body('institute')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Institute name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Institute name cannot exceed 100 characters'),
  body('degree')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Degree cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Degree cannot exceed 100 characters'),
  body('branch')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Branch cannot exceed 100 characters'),
  body('cgpa')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0, max: 100 })
    .withMessage('CGPA / Grade must be a number between 0 and 100'),
  body('startYear')
    .optional()
    .isInt({ min: 1950, max: 2100 })
    .withMessage('Start year must be a valid year between 1950 and 2100'),
  body('endYear')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1950, max: 2100 })
    .withMessage('End year must be a valid year between 1950 and 2100'),
  body('current')
    .optional()
    .isBoolean()
    .withMessage('Current status must be a boolean value'),
];

/**
 * Validation rules for education ID URL parameter
 */
export const educationIdParamValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid education ID format'),
];

/**
 * Validation rules for adding an experience record to profile
 */
export const addExperienceValidation = [
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  body('position')
    .trim()
    .notEmpty()
    .withMessage('Position title is required')
    .isLength({ max: 100 })
    .withMessage('Position title cannot exceed 100 characters'),
  body('employmentType')
    .optional({ checkFalsy: true })
    .trim()
    .isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance', 'Self-employed', ''])
    .withMessage('Invalid employment type choice'),
  body('location')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Please provide a valid ISO8601 start date (YYYY-MM-DD)'),
  body('endDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Please provide a valid ISO8601 end date (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (value && req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
        throw new Error('End date cannot be prior to start date');
      }
      return true;
    }),
  body('current')
    .optional()
    .isBoolean()
    .withMessage('Current status must be a boolean value'),
  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
];

/**
 * Validation rules for updating an experience record in profile
 */
export const updateExperienceValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid experience ID format'),
  body('company')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Company name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  body('position')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Position title cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Position title cannot exceed 100 characters'),
  body('employmentType')
    .optional({ checkFalsy: true })
    .trim()
    .isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance', 'Self-employed', ''])
    .withMessage('Invalid employment type choice'),
  body('location')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid ISO8601 start date (YYYY-MM-DD)'),
  body('endDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Please provide a valid ISO8601 end date (YYYY-MM-DD)'),
  body('current')
    .optional()
    .isBoolean()
    .withMessage('Current status must be a boolean value'),
  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
];

/**
 * Validation rules for experience ID URL parameter
 */
export const experienceIdParamValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid experience ID format'),
];
