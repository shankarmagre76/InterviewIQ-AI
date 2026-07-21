import ApiError from '../utils/ApiError.js';

/**
 * Role Authorization Middleware Placeholder
 * @param {...string} allowedRoles - Allowed user roles
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('User identity not verified'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Role '${req.user.role}' is not authorized to perform this action.`
        )
      );
    }

    next();
  };
};

export default authorizeRoles;
