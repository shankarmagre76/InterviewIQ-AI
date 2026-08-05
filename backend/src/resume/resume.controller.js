import resumeService from './resume.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../middleware/async.middleware.js';

/**
 * @desc    Upload a new PDF resume or replace current active resume
 * @route   POST /api/v1/resumes (or POST /api/v1/resume)
 * @access  Private (JWT Protected)
 */
export const uploadResume = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const resume = await resumeService.uploadOrReplaceResume(userId, req.file);

  return new ApiResponse(201, resume, 'Resume uploaded successfully').send(res);
});

/**
 * @desc    Get active resume or specific resume by ID
 * @route   GET /api/v1/resumes (Active resume) OR GET /api/v1/resumes/:id (Specific resume)
 * @access  Private (JWT Protected)
 */
export const getResume = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { id } = req.params;

  let resume;
  if (id) {
    resume = await resumeService.getResumeById(userId, id);
  } else {
    resume = await resumeService.getActiveResumeByUser(userId);
  }

  return new ApiResponse(200, resume, 'Resume retrieved successfully').send(res);
});

/**
 * @desc    Replace active resume document or update resume metadata
 * @route   PUT /api/v1/profile/resume (also PUT /api/v1/resumes/:id)
 * @access  Private (JWT Protected)
 */
export const updateResume = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { id } = req.params;

  // Branch A: Replacement file provided -> execute full file upload & Cloudinary replacement
  if (req.file) {
    const replacedResume = await resumeService.uploadOrReplaceResume(userId, req.file);
    return new ApiResponse(200, replacedResume, 'Resume document replaced successfully').send(res);
  }

  // Branch B: JSON metadata update -> update resume document fields
  let resume;
  if (id) {
    resume = await resumeService.getResumeById(userId, id);
  } else {
    resume = await resumeService.getActiveResumeByUser(userId);
  }

  if (req.body.originalName) {
    resume.originalName = req.body.originalName.trim();
    await resume.save();
  }

  return new ApiResponse(200, resume, 'Resume metadata updated successfully').send(res);
});

/**
 * @desc    Delete active resume or specific resume by ID
 * @route   DELETE /api/v1/resumes (Active resume) OR DELETE /api/v1/resumes/:id (Specific resume)
 * @access  Private (JWT Protected)
 */
export const deleteResume = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { id } = req.params;

  const result = await resumeService.deleteResume(userId, id || null);

  return new ApiResponse(200, result, 'Resume deleted successfully').send(res);
});

/**
 * @desc    Get complete resume upload history for logged-in user
 * @route   GET /api/v1/resumes/history
 * @access  Private (JWT Protected)
 */
export const getResumeHistory = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const history = await resumeService.getResumeHistory(userId);

  return new ApiResponse(200, history, 'Resume upload history retrieved successfully').send(res);
});
