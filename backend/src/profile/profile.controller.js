import profileService from './profile.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../middleware/async.middleware.js';

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/v1/profile
 * @access  Private (JWT Protected)
 */
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const profile = await profileService.getProfileByUserId(userId);
  return new ApiResponse(200, profile, 'User profile retrieved successfully').send(res);
});

/**
 * @desc    Update user profile details
 * @route   PUT /api/v1/profile
 * @access  Private (JWT Protected)
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const updatedProfile = await profileService.updateProfileByUserId(userId, req.body);
  return new ApiResponse(200, updatedProfile, 'Profile updated successfully').send(res);
});

/**
 * @desc    Upload & replace user profile avatar image
 * @route   POST /api/v1/profile/image (or PATCH /api/v1/profile/avatar)
 * @access  Private (JWT Protected)
 */
export const uploadProfileImageHandler = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No image file uploaded. Please attach an image under the "profileImage" field.');
  }

  const userId = req.user?._id || req.user?.id;
  const updatedProfile = await profileService.uploadProfileImage(userId, req.file.buffer);

  return new ApiResponse(200, updatedProfile, 'Profile image uploaded successfully').send(res);
});

/* ==========================================================================
   Skills Handlers
   ========================================================================== */

/**
 * @desc    Add a new skill to user profile
 * @route   POST /api/v1/profile/skills
 * @access  Private (JWT Protected)
 */
export const addSkillHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const skills = await profileService.addSkill(userId, req.body);
  return new ApiResponse(201, skills, 'Skill added successfully').send(res);
});

/**
 * @desc    Get all skills of logged-in user profile
 * @route   GET /api/v1/profile/skills
 * @access  Private (JWT Protected)
 */
export const getSkillsHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const skills = await profileService.getSkills(userId);
  return new ApiResponse(200, skills, 'Skills retrieved successfully').send(res);
});

/**
 * @desc    Update an existing skill in user profile
 * @route   PUT /api/v1/profile/skills/:id
 * @access  Private (JWT Protected)
 */
export const updateSkillHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const skillId = req.params.id;
  const updatedSkill = await profileService.updateSkill(userId, skillId, req.body);
  return new ApiResponse(200, updatedSkill, 'Skill updated successfully').send(res);
});

/**
 * @desc    Delete a skill from user profile
 * @route   DELETE /api/v1/profile/skills/:id
 * @access  Private (JWT Protected)
 */
export const deleteSkillHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const skillId = req.params.id;
  await profileService.deleteSkill(userId, skillId);
  return new ApiResponse(200, null, 'Skill deleted successfully').send(res);
});

/* ==========================================================================
   Education Handlers
   ========================================================================== */

/**
 * @desc    Add a new education record to user profile
 * @route   POST /api/v1/profile/education
 * @access  Private (JWT Protected)
 */
export const addEducationHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const education = await profileService.addEducation(userId, req.body);
  return new ApiResponse(201, education, 'Education record added successfully').send(res);
});

/**
 * @desc    Get all education records of logged-in user profile
 * @route   GET /api/v1/profile/education
 * @access  Private (JWT Protected)
 */
export const getEducationHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const education = await profileService.getEducation(userId);
  return new ApiResponse(200, education, 'Education records retrieved successfully').send(res);
});

/**
 * @desc    Update an existing education record in user profile
 * @route   PUT /api/v1/profile/education/:id
 * @access  Private (JWT Protected)
 */
export const updateEducationHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const educationId = req.params.id;
  const updatedEducation = await profileService.updateEducation(userId, educationId, req.body);
  return new ApiResponse(200, updatedEducation, 'Education record updated successfully').send(res);
});

/**
 * @desc    Delete an education record from user profile
 * @route   DELETE /api/v1/profile/education/:id
 * @access  Private (JWT Protected)
 */
export const deleteEducationHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const educationId = req.params.id;
  await profileService.deleteEducation(userId, educationId);
  return new ApiResponse(200, null, 'Education record deleted successfully').send(res);
});

/* ==========================================================================
   Experience Handlers
   ========================================================================== */

/**
 * @desc    Add a new experience record to user profile
 * @route   POST /api/v1/profile/experience
 * @access  Private (JWT Protected)
 */
export const addExperienceHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const experience = await profileService.addExperience(userId, req.body);
  return new ApiResponse(201, experience, 'Experience record added successfully').send(res);
});

/**
 * @desc    Get all experience records of logged-in user profile
 * @route   GET /api/v1/profile/experience
 * @access  Private (JWT Protected)
 */
export const getExperienceHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const experience = await profileService.getExperience(userId);
  return new ApiResponse(200, experience, 'Experience records retrieved successfully').send(res);
});

/**
 * @desc    Update an existing experience record in user profile
 * @route   PUT /api/v1/profile/experience/:id
 * @access  Private (JWT Protected)
 */
export const updateExperienceHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const experienceId = req.params.id;
  const updatedExperience = await profileService.updateExperience(userId, experienceId, req.body);
  return new ApiResponse(200, updatedExperience, 'Experience record updated successfully').send(res);
});

/**
 * @desc    Delete an experience record from user profile
 * @route   DELETE /api/v1/profile/experience/:id
 * @access  Private (JWT Protected)
 */
export const deleteExperienceHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const experienceId = req.params.id;
  await profileService.deleteExperience(userId, experienceId);
  return new ApiResponse(200, null, 'Experience record deleted successfully').send(res);
});

/* ==========================================================================
   Projects Handlers
   ========================================================================== */

/**
 * @desc    Add a new project to user profile
 * @route   POST /api/v1/profile/projects
 * @access  Private (JWT Protected)
 */
export const addProjectHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const projects = await profileService.addProject(userId, req.body);
  return new ApiResponse(201, projects, 'Project added successfully').send(res);
});

/**
 * @desc    Get all projects of logged-in user profile
 * @route   GET /api/v1/profile/projects
 * @access  Private (JWT Protected)
 */
export const getProjectsHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const projects = await profileService.getProjects(userId);
  return new ApiResponse(200, projects, 'Projects retrieved successfully').send(res);
});

/**
 * @desc    Update an existing project in user profile
 * @route   PUT /api/v1/profile/projects/:id
 * @access  Private (JWT Protected)
 */
export const updateProjectHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const projectId = req.params.id;
  const updatedProject = await profileService.updateProject(userId, projectId, req.body);
  return new ApiResponse(200, updatedProject, 'Project updated successfully').send(res);
});

/**
 * @desc    Delete a project from user profile
 * @route   DELETE /api/v1/profile/projects/:id
 * @access  Private (JWT Protected)
 */
export const deleteProjectHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const projectId = req.params.id;
  await profileService.deleteProject(userId, projectId);
  return new ApiResponse(200, null, 'Project deleted successfully').send(res);
});

/* ==========================================================================
   Certifications Handlers
   ========================================================================== */

/**
 * @desc    Add a new certification to user profile
 * @route   POST /api/v1/profile/certifications
 * @access  Private (JWT Protected)
 */
export const addCertificationHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const certs = await profileService.addCertification(userId, req.body);
  return new ApiResponse(201, certs, 'Certification added successfully').send(res);
});

/**
 * @desc    Get all certifications of logged-in user profile
 * @route   GET /api/v1/profile/certifications
 * @access  Private (JWT Protected)
 */
export const getCertificationsHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const certs = await profileService.getCertifications(userId);
  return new ApiResponse(200, certs, 'Certifications retrieved successfully').send(res);
});

/**
 * @desc    Update an existing certification in user profile
 * @route   PUT /api/v1/profile/certifications/:id
 * @access  Private (JWT Protected)
 */
export const updateCertificationHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const certId = req.params.id;
  const updatedCert = await profileService.updateCertification(userId, certId, req.body);
  return new ApiResponse(200, updatedCert, 'Certification updated successfully').send(res);
});

/**
 * @desc    Delete a certification from user profile
 * @route   DELETE /api/v1/profile/certifications/:id
 * @access  Private (JWT Protected)
 */
export const deleteCertificationHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const certId = req.params.id;
  await profileService.deleteCertification(userId, certId);
  return new ApiResponse(200, null, 'Certification deleted successfully').send(res);
});

/* ==========================================================================
   Social Links Handlers
   ========================================================================== */

/**
 * @desc    Get social links of logged-in user profile
 * @route   GET /api/v1/profile/social-links
 * @access  Private (JWT Protected)
 */
export const getSocialLinksHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const socialLinks = await profileService.getSocialLinks(userId);
  return new ApiResponse(200, socialLinks, 'Social links retrieved successfully').send(res);
});

/**
 * @desc    Update social links of logged-in user profile
 * @route   PUT /api/v1/profile/social-links
 * @access  Private (JWT Protected)
 */
export const updateSocialLinksHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const updatedSocialLinks = await profileService.updateSocialLinks(userId, req.body);
  return new ApiResponse(200, updatedSocialLinks, 'Social links updated successfully').send(res);
});

/* ==========================================================================
   Resume Handlers
   ========================================================================== */

/**
 * @desc    Get resume details of logged-in user profile
 * @route   GET /api/v1/profile/resume
 * @access  Private (JWT Protected)
 */
export const getResumeHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const resume = await profileService.getResume(userId);
  return new ApiResponse(200, resume, 'Resume details retrieved successfully').send(res);
});

/**
 * @desc    Update resume details of logged-in user profile
 * @route   PUT /api/v1/profile/resume
 * @access  Private (JWT Protected)
 */
export const updateResumeHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const updatedResume = await profileService.updateResume(userId, req.body);
  return new ApiResponse(200, updatedResume, 'Resume details updated successfully').send(res);
});

/**
 * @desc    Upload resume document to Cloudinary and update user profile
 * @route   POST /api/v1/profile/resume
 * @access  Private (JWT Protected)
 */
export const uploadResumeHandler = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No resume file uploaded. Please attach a PDF, DOC, or DOCX file.');
  }

  const userId = req.user?._id || req.user?.id;
  const resume = await profileService.uploadResume(userId, req.file);

  return new ApiResponse(200, resume, 'Resume uploaded successfully').send(res);
});

/**
 * @desc    Delete resume document from Cloudinary and clear profile resume data
 * @route   DELETE /api/v1/profile/resume
 * @access  Private (JWT Protected)
 */
export const deleteResumeHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  await profileService.deleteResume(userId);
  return new ApiResponse(200, null, 'Resume deleted successfully').send(res);
});


/* ==========================================================================
   Profile Completion Handler
   ========================================================================== */

/**
 * @desc    Calculate and return profile completion percentage
 * @route   GET /api/v1/profile/completion
 * @access  Private (JWT Protected)
 */
export const getProfileCompletionHandler = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const result = await profileService.calculateProfileCompletion(userId);
  return new ApiResponse(200, result, 'Profile completion percentage calculated successfully').send(res);
});

/**
 * @desc    Delete user profile
 * @route   DELETE /api/v1/profile
 * @access  Private (JWT Protected)
 */
export const deleteProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  await profileService.deleteProfileByUserId(userId);
  return new ApiResponse(200, null, 'Profile deleted successfully').send(res);
});
