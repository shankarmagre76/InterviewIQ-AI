import { body, param, validationResult } from 'express-validator';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Handle express-validator validation result errors.
 */
const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorArray = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    return new ApiResponse(400, null, 'Validation failed for resume analysis request', errorArray).send(res);
  }
  next();
};

/**
 * Validation rules for POST /api/v1/profile/resume/analyze
 */
export const validateAnalyzeResumeRequest = [
  body('resumeId')
    .optional()
    .isMongoId()
    .withMessage('Resume ID must be a valid MongoDB ObjectId'),
  body('targetRole')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Target role must be a string under 100 characters'),
  body('experienceLevel')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Experience level must be a string under 50 characters'),
  body('provider')
    .optional()
    .isString()
    .trim()
    .isIn(['Gemini', 'OpenAI', 'Claude', 'DeepSeek', 'Custom'])
    .withMessage('Provider must be one of: Gemini, OpenAI, Claude, DeepSeek, Custom'),
  validateResult,
];

/**
 * Validation rules for GET/DELETE /api/v1/profile/resume/analysis/:id
 */
export const validateAnalysisIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Analysis ID parameter must be a valid MongoDB ObjectId'),
  validateResult,
];
