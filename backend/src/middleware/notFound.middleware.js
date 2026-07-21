import ApiError from '../utils/ApiError.js';

/**
 * Handle 404 Route Not Found errors.
 */
const notFoundHandler = (req, res, next) => {
  const error = ApiError.notFound(`Route Not Found - [${req.method}] ${req.originalUrl}`);
  next(error);
};

export default notFoundHandler;
