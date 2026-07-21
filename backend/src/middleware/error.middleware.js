import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Global Centralized Error Handling Middleware for Express
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Mongoose / MongoDB errors
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error.errors || [], err.stack);
  }

  // Handle Specific Known Error Types
  if (err.name === 'CastError') {
    error = ApiError.badRequest(`Invalid resource ID format: ${err.value}`);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = ApiError.badRequest(`Duplicate value entered for ${field}. Please use another value.`);
  }

  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid authorization token signature');
  }

  if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Authorization token has expired');
  }

  const responsePayload = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
  };

  logger.error(`[${req.method}] ${req.originalUrl} - ${error.statusCode} - ${error.message}`);

  res.status(error.statusCode).json(responsePayload);
};

export default errorHandler;
