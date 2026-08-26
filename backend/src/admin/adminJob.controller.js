import asyncHandler from '../middleware/async.middleware.js';
import ApiResponse from '../utils/ApiResponse.js';
import adminJobService from './adminJob.service.js';

/**
 * Admin Job Controller Layer
 * Handles HTTP requests for admin job management, delegates to AdminJobService,
 * and sends standardized HTTP responses via ApiResponse.
 * Contains ZERO business logic.
 */

/**
 * @desc    GET /api/v1/admin/jobs
 *          Retrieve paginated list of all jobs across any status
 * @access  Private (Admin Only)
 */
export const listJobs = asyncHandler(async (req, res) => {
  const result = await adminJobService.listJobs(req.query);

  return new ApiResponse(
    200,
    result.jobs,
    'Jobs list retrieved successfully',
    {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    }
  ).send(res);
});

/**
 * @desc    POST /api/v1/admin/jobs
 *          Create a new job posting via Admin portal
 * @access  Private (Admin Only)
 */
export const createJob = asyncHandler(async (req, res) => {
  const adminUser = req.user;
  const newJob = await adminJobService.createJob(req.body, adminUser);

  return new ApiResponse(
    201,
    newJob,
    'Job posting created successfully via Admin portal'
  ).send(res);
});

/**
 * @desc    GET /api/v1/admin/jobs/:id
 *          Retrieve job posting details by ID
 * @access  Private (Admin Only)
 */
export const getJobById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const job = await adminJobService.getJobById(id);

  return new ApiResponse(
    200,
    job,
    'Job posting retrieved successfully'
  ).send(res);
});

/**
 * @desc    PUT or PATCH /api/v1/admin/jobs/:id
 *          Update job posting details
 * @access  Private (Admin Only)
 */
export const updateJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedJob = await adminJobService.updateJob(id, req.body);

  return new ApiResponse(
    200,
    updatedJob,
    'Job posting updated successfully'
  ).send(res);
});

/**
 * @desc    PATCH /api/v1/admin/jobs/:id/status
 *          Update job status (Active, Paused, Closed, Draft, Expired)
 * @access  Private (Admin Only)
 */
export const updateJobStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedJob = await adminJobService.updateJobStatus(id, req.body);

  return new ApiResponse(
    200,
    updatedJob,
    `Job status updated successfully to '${updatedJob.status}'`
  ).send(res);
});

/**
 * @desc    DELETE /api/v1/admin/jobs/:id
 *          Delete job posting (with Application Safety Guard)
 * @access  Private (Admin Only)
 */
export const deleteJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const force = req.query.force === 'true' || req.body.force === true;

  const result = await adminJobService.deleteJob(id, { force });

  return new ApiResponse(
    200,
    result,
    'Job posting deleted successfully'
  ).send(res);
});
