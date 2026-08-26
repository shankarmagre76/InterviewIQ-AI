import jwt from 'jsonwebtoken';

/**
 * Resolve Access Secret safely, enforcing strict secret configuration in production
 */
const getAccessSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is not defined!');
    }
    return 'default_access_secret_development_key_12345';
  }
  return secret;
};

/**
 * Resolve Refresh Secret safely, enforcing strict secret configuration in production
 */
const getRefreshSecret = () => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL SECURITY ERROR: REFRESH_TOKEN_SECRET environment variable is not defined!');
    }
    return 'default_refresh_secret_development_key_12345';
  }
  return secret;
};

/**
 * Generate Access Token
 * @param {object} payload
 * @returns {string}
 */
export const generateAccessToken = (payload) => {
  const secret = getAccessSecret();
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
  return jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn });
};

/**
 * Generate Refresh Token
 * @param {object} payload
 * @returns {string}
 */
export const generateRefreshToken = (payload) => {
  const secret = getRefreshSecret();
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn });
};

/**
 * Verify Access Token (Strictly enforced HS256 algorithm to prevent algorithm confusion attacks)
 * @param {string} token
 * @returns {object}
 */
export const verifyAccessToken = (token) => {
  const secret = getAccessSecret();
  return jwt.verify(token, secret, { algorithms: ['HS256'] });
};

/**
 * Verify Refresh Token (Strictly enforced HS256 algorithm to prevent algorithm confusion attacks)
 * @param {string} token
 * @returns {object}
 */
export const verifyRefreshToken = (token) => {
  const secret = getRefreshSecret();
  return jwt.verify(token, secret, { algorithms: ['HS256'] });
};
