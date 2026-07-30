import User from './auth.model.js';
import ApiError from '../utils/ApiError.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

class AuthService {
  /**
   * Register a new user account
   * @param {object} userData - { firstName, lastName, email, password, role, phone }
   * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
   */
  async register(userData) {
    const { firstName, lastName, email, password, role, phone } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.badRequest('An account with this email address already exists');
    }

    // Create user document
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'Student',
      phone: phone || '',
    });

    // Generate JWT access and refresh tokens
    const tokenPayload = { id: user._id, role: user.role, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token to user record
    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Authenticate existing user with email and password
   * @param {object} credentials - { email, password }
   * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
   */
  async login({ email, password }) {
    // Find user and explicitly select password and refreshToken
    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('User account is currently deactivated');
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate JWT access and refresh tokens
    const tokenPayload = { id: user._id, role: user.role, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Update refresh token and lastLogin in DB
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Generate new access token using a valid refresh token
   * @param {string} token
   * @returns {Promise<{ accessToken: string, refreshToken: string }>}
   */
  async refreshToken(token) {
    if (!token) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      throw ApiError.unauthorized('Invalid refresh token session');
    }

    const tokenPayload = { id: user._id, role: user.role, email: user.email };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    user.refreshToken = newRefreshToken;
    await user.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Invalidate refresh token upon logout
   * @param {string} userId
   */
  async logout(userId) {
    const user = await User.findById(userId);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
  }

  /**
   * Get user profile details by ID
   * @param {string} userId
   * @returns {Promise<object>}
   */
  async getUserProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User profile not found');
    }
    return user.toJSON();
  }

  /**
   * Update user profile
   * @param {string} userId
   * @param {object} updateData
   * @returns {Promise<object>}
   */
  async updateUserProfile(userId, updateData) {
    const allowedFields = ['firstName', 'lastName', 'phone', 'profileImage'];
    const fieldsToUpdate = {};

    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        fieldsToUpdate[key] = updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(userId, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user.toJSON();
  }

  /**
   * Change user password
   * @param {string} userId
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();
  }
}

export default new AuthService();
