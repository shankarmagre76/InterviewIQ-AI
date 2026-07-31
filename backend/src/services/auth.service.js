import User from '../models/User.js';
import Profile from '../models/profile.model.js';
import ApiError from '../utils/ApiError.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { sendEmail } from '../config/mail.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';
import mongoose from 'mongoose';

/**
 * Authentication Service
 * Complete production-ready business logic for InterviewIQ AI.
 */
class AuthService {
  /**
   * Register a new user account, auto-create associated Profile, and send email verification link
   * @param {object} userData - { firstName, lastName, email, password, role, phone }
   * @returns {Promise<{ user: object, profile: object, accessToken: string, refreshToken: string }>}
   */
  async registerUser(userData) {
    const { firstName, lastName, email, password, role, phone } = userData;

    // 1. Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.badRequest('An account with this email address already exists');
    }

    let user;
    let profile;
    let session = null;

    try {
      // Attempt transaction (supported on MongoDB Replica Sets)
      session = await mongoose.startSession();
      session.startTransaction();

      // 2. Create user document
      const [newUser] = await User.create(
        [
          {
            firstName,
            lastName,
            email,
            password,
            role: role || 'Student',
            phone: phone || '',
          },
        ],
        { session }
      );
      user = newUser;

      // 3. Prevent duplicate profiles & Create Profile linked to User
      const existingProfile = await Profile.findOne({ user: user._id }).session(session);
      if (existingProfile) {
        throw ApiError.badRequest('A profile for this user already exists');
      }

      const [newProfile] = await Profile.create(
        [
          {
            user: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone || '',
          },
        ],
        { session }
      );
      profile = newProfile;

      await session.commitTransaction();
      session.endSession();
    } catch (transactionError) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }

      // Fallback strategy for standalone MongoDB instances without transaction support
      if (
        transactionError.message?.includes('Transaction numbers are only allowed') ||
        transactionError.message?.includes('replica set')
      ) {
        user = await User.create({
          firstName,
          lastName,
          email,
          password,
          role: role || 'Student',
          phone: phone || '',
        });

        try {
          const existingProfile = await Profile.findOne({ user: user._id });
          if (existingProfile) {
            throw ApiError.badRequest('A profile for this user already exists');
          }

          profile = await Profile.create({
            user: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone || '',
          });
        } catch (profileError) {
          // Manual Rollback: delete created user if profile creation fails
          if (user && user._id) {
            await User.findByIdAndDelete(user._id);
          }
          throw profileError;
        }
      } else {
        throw transactionError;
      }
    }

    // 3. Generate verification token
    const verificationToken = user.getEmailVerificationToken();

    // 4. Generate JWT access & refresh tokens
    const tokenPayload = { id: user._id, role: user.role, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token & verification token fields
    user.refreshToken = refreshToken;
    await user.save();

    // 5. Send verification email
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const verifyUrl = `${clientUrl}/verify-email?token=${verificationToken}`;

    const textMessage = `Welcome to InterviewIQ AI, ${user.firstName}!\n\nPlease verify your email address by clicking on the link below:\n\n${verifyUrl}\n\nNote: This link will expire in 24 hours.`;
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4F46E5;">Welcome to InterviewIQ AI!</h2>
        <p>Hi ${user.firstName},</p>
        <p>Thank you for registering. Please verify your email address to complete your profile setup.</p>
        <div style="margin: 25px 0;">
          <a href="${verifyUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p style="font-size: 12px; color: #666;">Or copy and paste this link into your browser: <br><a href="${verifyUrl}">${verifyUrl}</a></p>
      </div>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'InterviewIQ AI - Verify Your Email Address',
        text: textMessage,
        html: htmlMessage,
      });
    } catch (err) {
      logger.error(`Failed to send verification email to ${user.email}: ${err.message}`);
    }

    return {
      user: user.toJSON(),
      profile: profile ? profile.toJSON() : null,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Authenticate existing user credentials
   * @param {object} credentials - { email, password }
   * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
   */
  async loginUser({ email, password }) {
    // 1. Find user & select password + refreshToken
    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    // 2. Check if account is active
    if (!user.isActive) {
      throw ApiError.forbidden('User account is currently deactivated. Please contact support.');
    }

    // 3. Verify password match
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    // 4. Generate access & refresh tokens
    const tokenPayload = { id: user._id, role: user.role, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // 5. Update refresh token & lastLogin
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
   * Log out user and invalidate active session / refresh token
   * @param {string} userId
   * @returns {Promise<{ message: string }>}
   */
  async logoutUser(userId) {
    const user = await User.findById(userId);
    if (user) {
      user.refreshToken = undefined;
      await user.save({ validateBeforeSave: false });
    }
    return { message: 'Logged out successfully.' };
  }

  /**
   * Generate new access token using valid refresh token
   * @param {string} token
   * @returns {Promise<{ accessToken: string, refreshToken: string }>}
   */
  async refreshAccessToken(token) {
    if (!token) {
      throw ApiError.unauthorized('Refresh token is required.');
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      throw ApiError.unauthorized('Invalid or expired refresh token.');
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      throw ApiError.unauthorized('Invalid or expired refresh token session.');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('User account is currently deactivated.');
    }

    const tokenPayload = { id: user._id, role: user.role, email: user.email };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Initiate password reset process via email
   * @param {string} email
   * @returns {Promise<{ message: string }>}
   */
  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw ApiError.notFound('No registered account was found with this email address.');
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    const message = `You are receiving this email because you requested a password reset for your InterviewIQ AI account.\n\nPlease click on the link below or paste it into your browser to reset your password:\n\n${resetUrl}\n\nNote: This reset link will expire in 10 minutes.`;

    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4F46E5;">InterviewIQ AI - Password Reset Request</h2>
        <p>Hi ${user.firstName || 'User'},</p>
        <p>You requested a password reset for your InterviewIQ AI account.</p>
        <p>Please click the button below to reset your password. This link is valid for <strong>10 minutes</strong>.</p>
        <div style="margin: 25px 0;">
          <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 12px; color: #666;">Or copy and paste this link in your browser: <br><a href="${resetUrl}">${resetUrl}</a></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888;">If you did not request a password reset, please ignore this email.</p>
      </div>
    `;

    try {
      const emailResult = await sendEmail({
        to: user.email,
        subject: 'InterviewIQ AI - Password Reset Request',
        text: message,
        html: htmlMessage,
        resetToken,
        resetUrl,
      });

      const isDev = process.env.NODE_ENV !== 'production';

      return {
        message: 'Password reset link sent to your email.',
        ...(isDev && emailResult?.simulated ? { devResetUrl: resetUrl, devResetToken: resetToken } : {}),
      };
    } catch (error) {
      logger.error(`[ForgotPassword Error]: ${error.message}`, error);

      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      if (error.code === 'EAUTH' || error.responseCode === 535) {
        throw ApiError.internal('Email service authentication failed. Please check your EMAIL_USER and EMAIL_PASS (Gmail App Password) in .env.');
      }

      throw ApiError.internal(error.message || 'Failed to send password reset email. Please try again later.');
    }
  }

  /**
   * Reset user password using token
   * @param {string} token
   * @param {string} newPassword
   * @returns {Promise<{ message: string }>}
   */
  async resetPassword(token, newPassword) {
    if (!token) {
      throw ApiError.badRequest('Reset token is required.');
    }
    if (!newPassword || newPassword.length < 6) {
      throw ApiError.badRequest('New password must be at least 6 characters long.');
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw ApiError.badRequest('Invalid or expired password reset token.');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return { message: 'Password has been reset successfully.' };
  }

  /**
   * Verify user email address with verification token
   * @param {string} token
   * @returns {Promise<{ message: string }>}
   */
  async verifyEmail(token) {
    if (!token) {
      throw ApiError.badRequest('Email verification token is required.');
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw ApiError.badRequest('Invalid or expired email verification token.');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    return { message: 'Email address verified successfully.' };
  }

  /**
   * Retrieve profile details for current authenticated user
   * @param {string} userId
   * @returns {Promise<object>}
   */
  async getUserProfile(userId) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to fetch profile.');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User profile not found.');
    }

    return user.toJSON();
  }
}

export default new AuthService();
