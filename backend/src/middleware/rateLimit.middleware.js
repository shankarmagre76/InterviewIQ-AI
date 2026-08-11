import rateLimit from 'express-rate-limit';
import ApiError from '../utils/ApiError.js';

/**
 * Standardized Rate Limit Exceeded Handler
 */
const rateLimitHandler = (message) => (req, res, next, options) => {
  throw ApiError.tooManyRequests(message || 'Too many requests. Please try again later.');
};

/**
 * Global API Rate Limiter
 * Limits general requests per IP (100 requests per 15 minutes)
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 100, // 100 requests per window
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: rateLimitHandler('Too many API requests from this IP. Please try again in 15 minutes.'),
});

/**
 * Sensitive Authentication Rate Limiter
 * Protects login, registration, and password reset endpoints (5 requests per 15 minutes)
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 5, // 5 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many authentication attempts. Please try again in 15 minutes.'),
});

/**
 * Expensive AI Generation Rate Limiter
 * Protects Gemini AI operations like Resume Analysis, Mock Interview Generation, and Roadmap Generation (10 requests per hour)
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'test' ? 1000 : 10, // 10 AI operations per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('AI quota limit exceeded for your IP. Please try again in 1 hour.'),
});

export default {
  globalRateLimiter,
  authRateLimiter,
  aiRateLimiter,
};
