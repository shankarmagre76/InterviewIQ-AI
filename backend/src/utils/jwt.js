import jwt from 'jsonwebtoken';

/**
 * Generate Access Token
 * @param {object} payload
 * @returns {string}
 */
export const generateAccessToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'default_access_secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Generate Refresh Token
 * @param {object} payload
 * @returns {string}
 */
export const generateRefreshToken = (payload) => {
  const secret = process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret';
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify Access Token
 * @param {string} token
 * @returns {object}
 */
export const verifyAccessToken = (token) => {
  const secret = process.env.JWT_SECRET || 'default_access_secret';
  return jwt.verify(token, secret);
};

/**
 * Verify Refresh Token
 * @param {string} token
 * @returns {object}
 */
export const verifyRefreshToken = (token) => {
  const secret = process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret';
  return jwt.verify(token, secret);
};
