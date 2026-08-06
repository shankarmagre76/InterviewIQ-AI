import savedJobService from './savedJob.service.js';
import asyncHandler from '../middleware/async.middleware.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * @desc    Save / Bookmark a job listing
 * @route   POST /api/v1/saved-jobs
 * @access  Private (Student/Candidate)
 */
export const saveJob = asyncHandler(async (req, res) => {
  const jobId = req.body.job || req.body.jobId;
  const savedJob = await savedJobService.saveJob(jobId, req.user);
  return new ApiResponse(201, savedJob, 'Job bookmarked successfully').send(res);
});

/**
 * @desc    Remove a job bookmark
 * @route   DELETE /api/v1/saved-jobs/:jobId
 * @access  Private (Student/Candidate)
 */
export const unsaveJob = asyncHandler(async (req, res) => {
  const result = await savedJobService.unsaveJob(req.params.jobId, req.user);
  return new ApiResponse(200, result, 'Job removed from saved list').send(res);
});

/**
 * @desc    Get candidate's saved job listings
 * @route   GET /api/v1/saved-jobs
 * @access  Private (Student/Candidate)
 */
export const getUserSavedJobs = asyncHandler(async (req, res) => {
  const result = await savedJobService.getUserSavedJobs(req.user, req.query);
  return new ApiResponse(200, result.savedJobs, 'Saved jobs retrieved successfully', {
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
  }).send(res);
});

/**
 * @desc    Check whether a job is bookmarked by the current candidate
 * @route   GET /api/v1/saved-jobs/check/:jobId
 * @access  Private (Student/Candidate)
 */
export const checkIsJobSaved = asyncHandler(async (req, res) => {
  const result = await savedJobService.checkIsJobSaved(req.params.jobId, req.user);
  return new ApiResponse(200, result, 'Saved status checked successfully').send(res);
});

export default {
  saveJob,
  unsaveJob,
  getUserSavedJobs,
  checkIsJobSaved,
};
