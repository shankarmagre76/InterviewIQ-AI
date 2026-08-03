import Profile from './profile.model.js';
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
   * Update user profile by user ID
   * @param {string} userId
   * @param {object} updateData
   * @returns {Promise<object>}
   */
  async updateProfileByUserId(userId, updateData) {
    // Service method stub - business logic to be implemented
    return null;
  }

  /**
   * Delete user profile by user ID
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  async deleteProfileByUserId(userId) {
    // Service method stub - business logic to be implemented
    return false;
  }
}

export default new ProfileService();
