import Profile from './profile.model.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

class ProfileService {
  /**
   * Fetch profile for logged-in user with populated User fields
   * @param {string} userId
   * @returns {Promise<object>}
   */
  async getProfileByUserId(userId) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to fetch profile');
    }

    const profile = await Profile.findOne({ user: userId }).populate(
      'user',
      'firstName lastName email role phone profileImage isEmailVerified isActive'
    );

    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    return profile;
  }

  /**
   * Update user basic profile by user ID
   * @param {string} userId
   * @param {object} updateData
   * @returns {Promise<object>}
   */
  async updateProfileByUserId(userId, updateData) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to update profile');
    }

    const allowedFields = [
      'firstName',
      'lastName',
      'phone',
      'gender',
      'dateOfBirth',
      'headline',
      'bio',
      'website',
      'currentLocation',
      'preferredLocation',
    ];

    const fieldsToUpdate = {};
    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        fieldsToUpdate[key] = updateData[key];
      }
    });

    const profile = await Profile.findOneAndUpdate(
      { user: userId },
      { $set: fieldsToUpdate },
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email role phone profileImage isEmailVerified isActive');

    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    // Synchronize basic user fields on User document if modified
    const userUpdates = {};
    if (fieldsToUpdate.firstName !== undefined) userUpdates.firstName = fieldsToUpdate.firstName;
    if (fieldsToUpdate.lastName !== undefined) userUpdates.lastName = fieldsToUpdate.lastName;
    if (fieldsToUpdate.phone !== undefined) userUpdates.phone = fieldsToUpdate.phone;

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(userId, { $set: userUpdates }, { runValidators: true });
    }

    return profile;
  }

  /**
   * Delete user profile by user ID
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  async deleteProfileByUserId(userId) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to delete profile');
    }

    const deleted = await Profile.findOneAndDelete({ user: userId });
    if (!deleted) {
      throw ApiError.notFound('User profile not found');
    }

    return true;
  }
}

export default new ProfileService();
