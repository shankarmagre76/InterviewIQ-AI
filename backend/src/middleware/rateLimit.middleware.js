import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import ApiError from '../utils/ApiError.js';

/**
 * Standardized Rate Limit Exceeded Handler returning HTTP 429
 */
const rateLimitHandler = (message) => (req, res, next, options) => {
  next(ApiError.tooManyRequests(message || 'Too many requests. Please try again later.'));
};

/**
 * Global API Rate Limiter
 * Category: General APIs (Profile, Jobs, Applications, Dashboard, Notifications)
 * Default: 100 requests per 15 minutes
 * Configurable via: RATE_LIMIT_GLOBAL_WINDOW_MS, RATE_LIMIT_GLOBAL_MAX
 */
export const globalRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_GLOBAL_WINDOW_MS) || 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 1000 : Number(process.env.RATE_LIMIT_GLOBAL_MAX) || 100,
  standardHeaders: true, // Return RateLimit-* headers
  legacyHeaders: false,
  skip: (req) => {
    // Exempt health checks and root index routes from rate limiting
    const url = (req.originalUrl || req.url || '').toLowerCase();
    return url === '/' || url === '/api' || url.includes('/health');
  },
  handler: rateLimitHandler('Too many API requests from this IP. Please try again in 15 minutes.'),
});

/**
 * Sensitive Authentication Rate Limiter
 * Category: Auth Endpoints (Login, Register, Forgot Password, Reset Password)
 * Default: 5 requests per 15 minutes to prevent brute-force attacks
 * Configurable via: RATE_LIMIT_AUTH_WINDOW_MS, RATE_LIMIT_AUTH_MAX
 */
export const authRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_AUTH_WINDOW_MS) || 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 1000 : Number(process.env.RATE_LIMIT_AUTH_MAX) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many authentication attempts. Please try again in 15 minutes.'),
});

/**
 * Expensive AI Generation Rate Limiter
 * Category: AI Endpoints (Resume Analysis, Interview Generation, Answer Evaluation, Roadmap Generation)
 * Default: 10 operations per hour to protect Gemini API quota and prevent resource exhaustion
 * Configurable via: RATE_LIMIT_AI_WINDOW_MS, RATE_LIMIT_AI_MAX
 * Identification: Per-User ID when authenticated, falling back to IP address
 */
export const aiRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_AI_WINDOW_MS) || 60 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 1000 : Number(process.env.RATE_LIMIT_AI_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Key by authenticated User ID if available, otherwise IP address
    const userId = req.user?._id || req.user?.id;
    if (userId) return userId.toString();
    return ipKeyGenerator(req);
  },
  handler: rateLimitHandler('AI quota limit exceeded for your account. Please try again in 1 hour.'),
});

export default {
  globalRateLimiter,
  authRateLimiter,
  aiRateLimiter,
};
