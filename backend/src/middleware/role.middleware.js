import ApiError from '../utils/ApiError.js';

/**
 * Role-Based Access Control (RBAC) Authorization Middleware
 * Restricts route access to specified allowed roles.
 * Supports variadic args authorizeRoles('Admin', 'Recruiter') or array authorizeRoles(['Admin', 'Recruiter']).
 * 
 * @param {...(string|string[])} allowedRoles - Permitted roles (e.g., 'Student', 'Recruiter', 'Admin')
 * @returns {import('express').RequestHandler}
 */
const authorizeRoles = (...allowedRoles) => {
  // Flatten array arguments if passed as authorizeRoles('Admin', 'Recruiter') or authorizeRoles(['Admin', 'Recruiter'])
  const roles = allowedRoles.flat().map((r) => String(r).toLowerCase());

  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required to access this resource.'));
    }

    const userRole = req.user.role ? String(req.user.role).toLowerCase() : '';

    if (!userRole || !roles.includes(userRole)) {
      return next(
        ApiError.forbidden(
          `Access denied. Role '${req.user.role || 'Unknown'}' is not authorized to access this resource.`
        )
      );
    }

    next();
  };
};

/**
 * Convenient shortcut middleware specifically for Admin-only routes
 */
export const authorizeAdmin = authorizeRoles('Admin');

export default authorizeRoles;

