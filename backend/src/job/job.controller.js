import jobService from './job.service.js';
import asyncHandler from '../middleware/async.middleware.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * @desc    Create a new job posting
 * @route   POST /api/v1/jobs
 * @access  Private (Recruiter/Admin)
 */
export const createJob = asyncHandler(async (req, res) => {
  const job = await jobService.createJob(req.body, req.user);
  return new ApiResponse(201, job, 'Job posting created successfully').send(res);
});

/**
 * @desc    Get detailed job posting by ID
 * @route   GET /api/v1/jobs/:id
 * @access  Public
 */
export const getJobDetails = asyncHandler(async (req, res) => {
  const job = await jobService.getJobDetails(req.params.id);
  return new ApiResponse(200, job, 'Job details retrieved successfully').send(res);
});

/**
 * @desc    Update an existing job posting
 * @route   PUT /api/v1/jobs/:id
 * @access  Private (Job Owner/Admin)
 */
export const updateJob = asyncHandler(async (req, res) => {
  const job = await jobService.updateJob(req.params.id, req.body, req.user);
  return new ApiResponse(200, job, 'Job posting updated successfully').send(res);
});

/**
 * @desc    Delete a job posting
 * @route   DELETE /api/v1/jobs/:id
 * @access  Private (Job Owner/Admin)
 */
export const deleteJob = asyncHandler(async (req, res) => {
  await jobService.deleteJob(req.params.id, req.user);
  return new ApiResponse(200, null, 'Job posting deleted successfully').send(res);
});

/**
 * @desc    Search, filter, & paginate job listings
 * @route   GET /api/v1/jobs
 * @access  Public
 */
export const searchJobs = asyncHandler(async (req, res) => {
  const result = await jobService.searchJobs(req.query);
  return new ApiResponse(200, result.jobs, 'Jobs retrieved successfully', {
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
  }).send(res);
});

export const getMyJobs = asyncHandler(async (req, res) => {
  const result = await jobService.getMyJobs(req.user, req.query);
  return new ApiResponse(200, result.jobs, 'Recruiter job postings retrieved successfully', {
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
  }).send(res);
});

export default {
  createJob,
  getMyJobs,
  getJobDetails,
  updateJob,
  deleteJob,
  searchJobs,
};
