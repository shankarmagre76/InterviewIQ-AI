import ApiError from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/jwt.js';

/**
 * Authentication Middleware Placeholder
 * Verifies Bearer JWT tokens in Authorization header or cookie
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = (authHeader && authHeader.startsWith('Bearer '))
      ? authHeader.split(' ')[1]
      : req.cookies?.accessToken;

    if (!token) {
      throw ApiError.unauthorized('Access denied. No authentication token provided.');
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(ApiError.unauthorized(error.message || 'Invalid or expired authentication token.'));
  }
};

export default authenticate;
