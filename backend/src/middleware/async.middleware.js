/**
 * Higher-order async handler wrapper to automatically pass rejected promises to Express error middleware.
 * @param {Function} fn - Async controller function
 * @returns {import('express').RequestHandler}
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
