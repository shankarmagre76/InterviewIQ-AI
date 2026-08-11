/**
 * Custom operational API Error class for throwing structured HTTP errors.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (4xx, 5xx)
   * @param {string} message - Error description
   * @param {Array} [errors=[]] - Array of validation or field errors
   * @param {string} [stack=""] - Custom stack trace
   */
  constructor(statusCode, message = 'Something went wrong', errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(msg = 'Bad Request', errors = []) {
    return new ApiError(400, msg, errors);
  }

  static unauthorized(msg = 'Unauthorized access') {
    return new ApiError(401, msg);
  }

  static forbidden(msg = 'Forbidden resource') {
    return new ApiError(403, msg);
  }

  static notFound(msg = 'Resource not found') {
    return new ApiError(404, msg);
  }

  static tooManyRequests(msg = 'Too many requests. Please try again later.') {
    return new ApiError(429, msg);
  }

  static internal(msg = 'Internal Server Error') {
    return new ApiError(500, msg);
  }
}

export default ApiError;
