import Profile from './profile.model.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.util.js';

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
   * Upload profile image to Cloudinary, delete previous image, and update Profile & User models
   * @param {string} userId
   * @param {Buffer} fileBuffer
   * @returns {Promise<object>}
   */
  async uploadProfileImage(userId, fileBuffer) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to upload profile image');
    }
    if (!fileBuffer) {
      throw ApiError.badRequest('Please provide an image file');
    }

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    // Delete existing Cloudinary image asset if present
    if (profile.profileImage) {
      await deleteFromCloudinary(profile.profileImage);
    }

    // Upload new image buffer to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(fileBuffer, 'interviewiq/profiles');
    const secureUrl = cloudinaryResult.secure_url;

    // Save secure URL in Profile model
    profile.profileImage = secureUrl;
    await profile.save();

    // Synchronize profileImage URL on User model
    await User.findByIdAndUpdate(userId, { profileImage: secureUrl });

    // Re-populate user details for return payload
    await profile.populate(
      'user',
      'firstName lastName email role phone profileImage isEmailVerified isActive'
    );

    return profile;
  }

  /* ==========================================================================
     Skills Sub-resource Methods
     ========================================================================== */

  /**
   * Add a new skill to user profile
   * @param {string} userId
   * @param {object} skillData - { name, level }
   * @returns {Promise<Array>} Updated skills array
   */
  async addSkill(userId, { name, level }) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to add skill');
    }

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    const normalizedName = name.trim().toLowerCase();
    const isDuplicate = profile.skills.some(
      (skill) => skill.name.trim().toLowerCase() === normalizedName
    );

    if (isDuplicate) {
      throw ApiError.badRequest(`Skill "${name.trim()}" already exists in your profile`);
    }

    profile.skills.push({
      name: name.trim(),
      level: level || 'Beginner',
    });

    await profile.save();
    return profile.skills;
  }

  /**
   * Fetch all skills of logged-in user profile
   * @param {string} userId
   * @returns {Promise<Array>} List of skills
   */
  async getSkills(userId) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to fetch skills');
    }

    const profile = await Profile.findOne({ user: userId }).select('skills');
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    return profile.skills;
  }

  /**
   * Update an existing skill in user profile by skill ID
   * @param {string} userId
   * @param {string} skillId
   * @param {object} updateData - { name, level }
   * @returns {Promise<object>} Updated skill subdocument
   */
  async updateSkill(userId, skillId, { name, level }) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to update skill');
    }

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    const skill = profile.skills.id(skillId);
    if (!skill) {
      throw ApiError.notFound('Skill not found in user profile');
    }

    if (name !== undefined) {
      const normalizedName = name.trim().toLowerCase();
      const isDuplicate = profile.skills.some(
        (s) => s._id.toString() !== skillId && s.name.trim().toLowerCase() === normalizedName
      );
      if (isDuplicate) {
        throw ApiError.badRequest(`Another skill named "${name.trim()}" already exists`);
      }
      skill.name = name.trim();
    }

    if (level !== undefined) {
      skill.level = level;
    }

    await profile.save();
    return skill;
  }

  /**
   * Delete a skill from user profile by skill ID
   * @param {string} userId
   * @param {string} skillId
   * @returns {Promise<boolean>} True upon deletion
   */
  async deleteSkill(userId, skillId) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to delete skill');
    }

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    const skill = profile.skills.id(skillId);
    if (!skill) {
      throw ApiError.notFound('Skill not found in user profile');
    }

    profile.skills.pull(skillId);
    await profile.save();
    return true;
  }

  /* ==========================================================================
     Education Sub-resource Methods
     ========================================================================== */

  /**
   * Add a new education entry to user profile
   * @param {string} userId
   * @param {object} educationData - { institute, degree, branch, cgpa, startYear, endYear, current }
   * @returns {Promise<Array>} Updated education array
   */
  async addEducation(userId, educationData) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to add education');
    }

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    profile.education.push(educationData);
    await profile.save();
    return profile.education;
  }

  /**
   * Fetch all education records of logged-in user profile
   * @param {string} userId
   * @returns {Promise<Array>} List of education records
   */
  async getEducation(userId) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to fetch education records');
    }

    const profile = await Profile.findOne({ user: userId }).select('education');
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    return profile.education;
  }

  /**
   * Update an existing education record in user profile by education ID
   * @param {string} userId
   * @param {string} educationId
   * @param {object} updateData
   * @returns {Promise<object>} Updated education subdocument
   */
  async updateEducation(userId, educationId, updateData) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to update education');
    }

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    const eduItem = profile.education.id(educationId);
    if (!eduItem) {
      throw ApiError.notFound('Education record not found in user profile');
    }

    const allowedFields = ['institute', 'degree', 'branch', 'cgpa', 'startYear', 'endYear', 'current'];
    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        eduItem[key] = updateData[key];
      }
    });

    await profile.save();
    return eduItem;
  }

  /**
   * Delete an education record from user profile by education ID
   * @param {string} userId
   * @param {string} educationId
   * @returns {Promise<boolean>} True upon deletion
   */
  async deleteEducation(userId, educationId) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to delete education');
    }

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    const eduItem = profile.education.id(educationId);
    if (!eduItem) {
      throw ApiError.notFound('Education record not found in user profile');
    }

    profile.education.pull(educationId);
    await profile.save();
    return true;
  }

  /* ==========================================================================
     Experience Sub-resource Methods
     ========================================================================== */

  /**
   * Add a new experience entry to user profile
   * @param {string} userId
   * @param {object} experienceData - { company, position, employmentType, location, startDate, endDate, current, description }
   * @returns {Promise<Array>} Updated experience array
   */
  async addExperience(userId, experienceData) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to add experience');
    }

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    profile.experience.push(experienceData);
    await profile.save();
    return profile.experience;
  }

  /**
   * Fetch all experience records of logged-in user profile
   * @param {string} userId
   * @returns {Promise<Array>} List of experience records
   */
  async getExperience(userId) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to fetch experience records');
    }

    const profile = await Profile.findOne({ user: userId }).select('experience');
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    return profile.experience;
  }

  /**
   * Update an existing experience record in user profile by experience ID
   * @param {string} userId
   * @param {string} experienceId
   * @param {object} updateData
   * @returns {Promise<object>} Updated experience subdocument
   */
  async updateExperience(userId, experienceId, updateData) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to update experience');
    }

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    const expItem = profile.experience.id(experienceId);
    if (!expItem) {
      throw ApiError.notFound('Experience record not found in user profile');
    }

    const allowedFields = [
      'company',
      'position',
      'employmentType',
      'location',
      'startDate',
      'endDate',
      'current',
      'description',
    ];
    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        expItem[key] = updateData[key];
      }
    });

    await profile.save();
    return expItem;
  }

  /**
   * Delete an experience record from user profile by experience ID
   * @param {string} userId
   * @param {string} experienceId
   * @returns {Promise<boolean>} True upon deletion
   */
  async deleteExperience(userId, experienceId) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to delete experience');
    }

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    const expItem = profile.experience.id(experienceId);
    if (!expItem) {
      throw ApiError.notFound('Experience record not found in user profile');
    }

    profile.experience.pull(experienceId);
    await profile.save();
    return true;
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

    const profile = await Profile.findOneAndDelete({ user: userId });
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    if (profile.profileImage) {
      await deleteFromCloudinary(profile.profileImage);
    }

    return true;
  }
}

export default new ProfileService();
