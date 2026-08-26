import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Sanitize error message to ensure API keys, passwords, and tokens are never printed in logs
 */
const sanitizeLogMessage = (message = '') => {
  if (typeof message !== 'string') return String(message);
  return message
    .replace(/(password|secret|token|apiKey|key)=[^&\s]+/gi, '$1=[REDACTED]')
    .replace(/Bearer\s+[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/gi, 'Bearer [REDACTED]');
};

/**
 * Global Centralized Error Handling Middleware for Express
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Body Parser Payload Too Large Errors (HTTP 413)
  if (err.type === 'entity.too.large' || err.status === 413 || err.statusCode === 413) {
    error = new ApiError(413, 'Payload Too Large. Request body exceeds maximum allowed 1MB limit.');
  }

  // Handle Multer File Upload Errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = new ApiError(413, 'File size limit exceeded. Maximum allowed file size is 5MB.');
    } else {
      error = ApiError.badRequest(`File upload error: ${err.message}`);
    }
  }

  // Handle Specific Mongoose / MongoDB errors
  if (err.name === 'CastError') {
    error = ApiError.badRequest(`Invalid resource ID format: ${err.value}`);
  } else if (err.name === 'ValidationError') {
    const errorMessages = Object.values(err.errors || {}).map((e) => e.message);
    error = ApiError.badRequest('Database validation failed', errorMessages);
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = ApiError.badRequest(`Duplicate value entered for ${field}. Please use another value.`);
  }

  // Handle JWT Auth Errors
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid authorization token signature');
  } else if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Authorization token has expired');
  }

  // Handle Non-Operational / Unexpected 500 Programming Errors
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error.status || 500;
    const isProduction = process.env.NODE_ENV === 'production';
    const message = isProduction ? 'An internal server error occurred. Please contact support.' : error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, [], err.stack);
  }

  // In production, conceal raw 500 error details to avoid information disclosure
  let clientMessage = error.message;
  if (process.env.NODE_ENV === 'production' && error.statusCode === 500) {
    clientMessage = 'An internal server error occurred. Please contact support.';
  }

  const responsePayload = {
    success: false,
    statusCode: error.statusCode,
    message: clientMessage,
    errors: error.errors || [],
    requestId: req.requestId,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
  };

  const safeLogMsg = sanitizeLogMessage(
    `[${req.method}] ${req.originalUrl} - ${error.statusCode} - ${error.message} [ReqID: ${req.requestId || 'N/A'}]`
  );
  if (error.statusCode >= 500) {
    logger.error(safeLogMsg);
  } else {
    logger.info(safeLogMsg);
  }

  res.status(error.statusCode).json(responsePayload);
};

export default errorHandler;
