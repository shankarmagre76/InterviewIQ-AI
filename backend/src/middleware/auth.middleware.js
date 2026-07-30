import ApiError from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import asyncHandler from './async.middleware.js';

/**
 * Authentication Middleware
 * Validates Bearer JWT tokens, verifies user in DB, and attaches user to req.user.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Read Bearer token from Authorization header or cookies
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw ApiError.unauthorized('Access denied. No authentication token provided.');
  }

  // 2. Verify JWT Token
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (error) {
    throw ApiError.unauthorized('Invalid or expired authentication token.');
  }

  if (!decoded || !decoded.id) {
    throw ApiError.unauthorized('Invalid token payload.');
  }

  // 3. Find user in Database
  const user = await User.findById(decoded.id);
  if (!user) {
    throw ApiError.unauthorized('User belonging to this token no longer exists.');
  }

  if (!user.isActive) {
    throw ApiError.unauthorized('User account is currently deactivated.');
  }

  // 4. Attach user to request object
  req.user = user;
  next();
});

export default authenticate;
