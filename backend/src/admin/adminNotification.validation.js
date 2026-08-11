import { body, param, query, validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';
import { NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES } from '../notification/notification.model.js';

/**
 * Universal Validation Result Middleware
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
 * Validation rules for Sending Admin System Announcements
 */
export const sendAnnouncementValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Announcement title is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),

  body('message')
    .trim()
    .notEmpty()
    .withMessage('Announcement message is required')
    .isLength({ min: 5, max: 2000 })
    .withMessage('Message must be between 5 and 2000 characters'),

  body('type')
    .optional()
    .trim()
    .isIn(NOTIFICATION_TYPES)
    .withMessage(`type must be one of: ${NOTIFICATION_TYPES.join(', ')}`),

  body('priority')
    .optional()
    .trim()
    .isIn(NOTIFICATION_PRIORITIES)
    .withMessage(`priority must be one of: ${NOTIFICATION_PRIORITIES.join(', ')}`),

  body('audience')
    .trim()
    .notEmpty()
    .withMessage('audience is required')
    .isIn(['ALL', 'USERS', 'ROLE'])
    .withMessage("audience must be 'ALL', 'USERS', or 'ROLE'"),

  body('userIds')
    .optional()
    .isArray()
    .withMessage('userIds must be an array of user ObjectIds'),

  body('userIds.*')
    .optional()
    .isMongoId()
    .withMessage('Each user ID in userIds must be a valid MongoDB ObjectId'),

  body('targetRole')
    .optional()
    .trim()
    .isIn(['Student', 'Recruiter', 'Admin'])
    .withMessage("targetRole must be 'Student', 'Recruiter', or 'Admin'"),

  validate,
];

/**
 * Notification ID Parameter Validation Rule
 */
export const notificationIdParamValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Notification ID format'),
  validate,
];

/**
 * Admin Notification Query Parameter Validation Rules
 */
export const adminNotificationQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be an integer greater than or equal to 1'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100'),

  query('type')
    .optional()
    .trim()
    .isIn(NOTIFICATION_TYPES)
    .withMessage(`type must be one of: ${NOTIFICATION_TYPES.join(', ')}`),

  query('priority')
    .optional()
    .trim()
    .isIn(NOTIFICATION_PRIORITIES)
    .withMessage(`priority must be one of: ${NOTIFICATION_PRIORITIES.join(', ')}`),

  query('user')
    .optional()
    .isMongoId()
    .withMessage('user must be a valid MongoDB ObjectId'),

  validate,
];

export default {
  validate,
  sendAnnouncementValidation,
  notificationIdParamValidation,
  adminNotificationQueryValidation,
};
