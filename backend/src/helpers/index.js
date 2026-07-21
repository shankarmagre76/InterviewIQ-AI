import { v4 as uuidv4 } from 'uuid';

/**
 * Helper to generate unique identifier string
 * @returns {string}
 */
export const generateUniqueId = () => uuidv4();

/**
 * Helper to format validation errors from express-validator
 * @param {Array} errors
 * @returns {Array<{field: string, message: string}>}
 */
export const formatValidationErrors = (errors) => {
  return errors.map((err) => ({
    field: err.path || err.param,
    message: err.msg,
  }));
};

/**
 * Helper to sanitize object by removing sensitive fields
 * @param {object} obj
 * @param {string[]} keysToOmit
 * @returns {object}
 */
export const omitFields = (obj, keysToOmit = ['password', '__v']) => {
  if (!obj) return obj;
  const clone = { ...obj };
  keysToOmit.forEach((key) => delete clone[key]);
  return clone;
};
