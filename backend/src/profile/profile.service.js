import Profile from './profile.model.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadRawToCloudinary,
  deleteRawFromCloudinary,
} from '../utils/cloudinary.util.js';


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
   * @param {object} educationData
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
   * @param {object} experienceData
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

  /* ==========================================================================
     Projects Sub-resource Methods
     ========================================================================== */

  /**
   * Add a new project to user profile
   * @param {string} userId
   * @param {object} projectData
   * @returns {Promise<Array>} Updated projects array
   */
  async addProject(userId, projectData) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to add project');
    }

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    if (projectData.title) {
      projectData.title = projectData.title.trim();
    } else if (projectData.name) {
      projectData.title = projectData.name.trim();
    }

    if (typeof projectData.technologies === 'string') {
      projectData.technologies = projectData.technologies
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }

    profile.projects.push(projectData);
    await profile.save();
    return profile.projects;
  }

  /**
   * Fetch all projects of logged-in user profile
   * @param {string} userId
   * @returns {Promise<Array>} List of projects
   */
  async getProjects(userId) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to fetch projects');
    }

    const profile = await Profile.findOne({ user: userId }).select('projects');
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    return profile.projects || [];
  }

  /**
   * Update an existing project in user profile by project ID
   * @param {string} userId
   * @param {string} projectId
   * @param {object} updateData
   * @returns {Promise<object>} Updated project subdocument
   */
  async updateProject(userId, projectId, updateData) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to update project');
    }

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    const projectItem = profile.projects.id(projectId);
    if (!projectItem) {
      throw ApiError.notFound('Project record not found in user profile');
    }

    const allowedFields = [
      'title',
      'name',
      'description',
      'technologies',
      'role',
      'startDate',
      'endDate',
      'current',
      'githubUrl',
      'liveUrl',
      'projectType',
    ];

    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        if (key === 'name' || key === 'title') {
          projectItem.title = (updateData[key] || '').trim();
        } else if (key === 'technologies' && typeof updateData[key] === 'string') {
          projectItem.technologies = updateData[key]
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
        } else {
          projectItem[key] = updateData[key];
        }
      }
    });

    await profile.save();
    return projectItem;
  }

  /**
   * Delete a project from user profile by project ID
   * @param {string} userId
   * @param {string} projectId
   * @returns {Promise<boolean>} True upon deletion
   */
  async deleteProject(userId, projectId) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to delete project');
    }

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    const projectItem = profile.projects.id(projectId);
    if (!projectItem) {
      throw ApiError.notFound('Project record not found in user profile');
    }

    profile.projects.pull(projectId);
    await profile.save();
    return true;
  }

  /* ==========================================================================
     Certifications Sub-resource Methods
     ========================================================================== */

  /**
   * Add a new certification to user profile
   * @param {string} userId
   * @param {object} certData
   * @returns {Promise<Array>} Updated certifications array
   */
  async addCertification(userId, certData) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to add certification');
    }

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    if (certData.title) {
      certData.title = certData.title.trim();
    } else if (certData.name) {
      certData.title = certData.name.trim();
    }

    profile.certifications.push(certData);
    await profile.save();
    return profile.certifications;
  }

  /**
   * Fetch all certifications of logged-in user profile
   * @param {string} userId
   * @returns {Promise<Array>} List of certifications
   */
  async getCertifications(userId) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to fetch certifications');
    }

    const profile = await Profile.findOne({ user: userId }).select('certifications');
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    return profile.certifications || [];
  }

  /**
   * Update an existing certification in user profile by certification ID
   * @param {string} userId
   * @param {string} certId
   * @param {object} updateData
   * @returns {Promise<object>} Updated certification subdocument
   */
  async updateCertification(userId, certId, updateData) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to update certification');
    }

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    const certItem = profile.certifications.id(certId);
    if (!certItem) {
      throw ApiError.notFound('Certification record not found in user profile');
    }

    const allowedFields = [
      'title',
      'name',
      'issuingOrganization',
      'issueDate',
      'expiryDate',
      'doesNotExpire',
      'credentialId',
      'credentialUrl',
    ];

    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        if (key === 'name' || key === 'title') {
          certItem.title = (updateData[key] || '').trim();
        } else {
          certItem[key] = updateData[key];
        }
      }
    });

    await profile.save();
    return certItem;
  }

  /**
   * Delete a certification from user profile by certification ID
   * @param {string} userId
   * @param {string} certId
   * @returns {Promise<boolean>} True upon deletion
   */
  async deleteCertification(userId, certId) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to delete certification');
    }

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    const certItem = profile.certifications.id(certId);
    if (!certItem) {
      throw ApiError.notFound('Certification record not found in user profile');
    }

    profile.certifications.pull(certId);
    await profile.save();
    return true;
  }

  /* ==========================================================================
     Social Links Methods
     ========================================================================== */

  /**
   * Fetch social links for user profile
   * @param {string} userId
   * @returns {Promise<object>} Social links object
   */
  async getSocialLinks(userId) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to fetch social links');
    }

    const profile = await Profile.findOne({ user: userId }).select('socialLinks');
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    return profile.socialLinks || {};
  }

  /**
   * Update social links for user profile
   * @param {string} userId
   * @param {object} socialLinksData
   * @returns {Promise<object>} Updated social links object
   */
  async updateSocialLinks(userId, socialLinksData) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to update social links');
    }

    const allowedFields = ['github', 'linkedin', 'portfolio', 'leetcode', 'hackerrank', 'codechef'];
    const fieldsToUpdate = {};
    Object.keys(socialLinksData).forEach((key) => {
      if (allowedFields.includes(key)) {
        fieldsToUpdate[`socialLinks.${key}`] = socialLinksData[key];
      }
    });

    const profile = await Profile.findOneAndUpdate(
      { user: userId },
      { $set: fieldsToUpdate },
      { new: true, runValidators: true }
    ).select('socialLinks');

    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    return profile.socialLinks;
  }

  /* ==========================================================================
     Resume Details Methods
     ========================================================================== */

  /**
   * Fetch resume details for user profile
   * @param {string} userId
   * @returns {Promise<object>} Resume object
   */
  async getResume(userId) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to fetch resume');
    }

    const profile = await Profile.findOne({ user: userId }).select('resume');
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    return profile.resume || {};
  }

  /**
   * Update resume details for user profile
   * @param {string} userId
   * @param {object} resumeData
   * @returns {Promise<object>} Updated resume object
   */
  async updateResume(userId, resumeData) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to update resume');
    }

    const allowedFields = ['url', 'publicId', 'uploadedDate'];
    const fieldsToUpdate = {};
    Object.keys(resumeData).forEach((key) => {
      if (allowedFields.includes(key)) {
        fieldsToUpdate[`resume.${key}`] = resumeData[key];
      }
    });

    if (resumeData.url && !resumeData.uploadedDate) {
      fieldsToUpdate['resume.uploadedDate'] = new Date();
    }

    const profile = await Profile.findOneAndUpdate(
      { user: userId },
      { $set: fieldsToUpdate },
      { new: true, runValidators: true }
    ).select('resume');

    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    return profile.resume;
  }

  /**
   * Upload resume document to Cloudinary raw storage, delete previous document if exists, and save metadata
   * @param {string} userId
   * @param {object} file - Express.Multer.File object (buffer, originalname, size, mimetype)
   * @returns {Promise<object>} Resume subdocument metadata
   */
  async uploadResume(userId, file) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to upload resume');
    }
    if (!file || !file.buffer) {
      throw ApiError.badRequest('Please provide a valid resume file (PDF, DOC, DOCX)');
    }

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    // Delete existing Cloudinary raw asset if present
    const existingPublicId = profile.resume?.cloudinaryPublicId || profile.resume?.publicId;
    const existingUrl = profile.resume?.resumeUrl || profile.resume?.url;

    if (existingPublicId || existingUrl) {
      await deleteRawFromCloudinary(existingPublicId || existingUrl);
    }

    // Upload file buffer to Cloudinary raw storage
    const cloudinaryResult = await uploadRawToCloudinary(file.buffer, 'interviewiq/resumes');
    const now = new Date();

    const resumeData = {
      resumeUrl: cloudinaryResult.secure_url,
      cloudinaryPublicId: cloudinaryResult.public_id,
      originalFileName: file.originalname,
      fileSize: file.size,
      uploadedAt: now,
      // Backward compatibility fields
      url: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id,
      uploadedDate: now,
    };

    profile.resume = resumeData;
    await profile.save();

    return profile.resume;
  }

  /**
   * Delete resume document from Cloudinary and reset profile resume metadata
   * @param {string} userId
   * @returns {Promise<boolean>} True upon deletion
   */
  async deleteResume(userId) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to delete resume');
    }

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    const existingPublicId = profile.resume?.cloudinaryPublicId || profile.resume?.publicId;
    const existingUrl = profile.resume?.resumeUrl || profile.resume?.url;

    if (existingPublicId || existingUrl) {
      await deleteRawFromCloudinary(existingPublicId || existingUrl);
    }

    profile.resume = {
      resumeUrl: '',
      cloudinaryPublicId: '',
      originalFileName: '',
      fileSize: 0,
      uploadedAt: null,
      url: '',
      publicId: '',
      uploadedDate: null,
    };

    await profile.save();
    return true;
  }

  /* ==========================================================================
     Profile Completion Calculation Method
     ========================================================================== */


  /**
   * Calculate profile completion percentage based on 7 sections:
   * Basic Info (20%), Photo (15%), Skills (15%), Education (15%), Experience (15%), Resume (10%), Social Links (10%)
   * @param {string} userId
   * @returns {Promise<{ completion: number }>}
   */
  async calculateProfileCompletion(userId) {
    if (!userId) {
      throw ApiError.unauthorized('User ID is required to calculate profile completion');
    }

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }

    let completion = 0;

    // 1. Basic Info (20%)
    const basicInfoFields = [
      profile.firstName,
      profile.lastName,
      profile.phone,
      profile.headline,
      profile.bio,
      profile.currentLocation,
    ];
    const filledBasicCount = basicInfoFields.filter((field) => Boolean(field && field.trim())).length;
    completion += Math.round((filledBasicCount / basicInfoFields.length) * 20);

    // 2. Photo (15%)
    if (profile.profileImage && profile.profileImage.trim()) {
      completion += 15;
    }

    // 3. Skills (15%)
    if (profile.skills && profile.skills.length > 0) {
      completion += 15;
    }

    // 4. Education (15%)
    if (profile.education && profile.education.length > 0) {
      completion += 15;
    }

    // 5. Experience (15%)
    if (profile.experience && profile.experience.length > 0) {
      completion += 15;
    }

    // 6. Resume (10%)
    if (profile.resume && profile.resume.url && profile.resume.url.trim()) {
      completion += 10;
    }

    // 7. Social Links (10%)
    if (profile.socialLinks) {
      const socialFields = [
        profile.socialLinks.github,
        profile.socialLinks.linkedin,
        profile.socialLinks.portfolio,
        profile.socialLinks.leetcode,
        profile.socialLinks.hackerrank,
        profile.socialLinks.codechef,
      ];
      const filledSocialCount = socialFields.filter((link) => Boolean(link && link.trim())).length;
      if (filledSocialCount > 0) {
        completion += Math.min(10, filledSocialCount * 5);
      }
    }

    return { completion: Math.min(100, completion) };
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
