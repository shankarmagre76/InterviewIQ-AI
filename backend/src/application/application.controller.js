import applicationService from './application.service.js';
import asyncHandler from '../middleware/async.middleware.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * @desc    Submit a job application
 * @route   POST /api/v1/applications
 * @access  Private (Student/Candidate)
 */
export const applyJob = asyncHandler(async (req, res) => {
  const application = await applicationService.applyJob(req.body, req.user);
  return new ApiResponse(201, application, 'Job application submitted successfully').send(res);
});

/**
 * @desc    Get details of a specific application
 * @route   GET /api/v1/applications/:id
 * @access  Private (Applicant/Recruiter/Admin)
 */
export const getApplicationDetails = asyncHandler(async (req, res) => {
  const application = await applicationService.getApplicationDetails(req.params.id, req.user);
  return new ApiResponse(200, application, 'Application details retrieved successfully').send(res);
});

/**
 * @desc    Update application status, interview date, or feedback
 * @route   PATCH /api/v1/applications/:id/status
 * @access  Private (Recruiter/Admin)
 */
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const application = await applicationService.updateApplicationStatus(
    req.params.id,
    req.body,
    req.user
  );
  return new ApiResponse(200, application, 'Application status updated successfully').send(res);
});

/**
 * @desc    Get candidate's submitted job applications
 * @route   GET /api/v1/applications/me
 * @access  Private (Student/Candidate)
 */
export const getCandidateApplications = asyncHandler(async (req, res) => {
  const result = await applicationService.getCandidateApplications(req.user, req.query);
  return new ApiResponse(200, result.applications, 'Candidate applications retrieved successfully', {
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
  }).send(res);
});

/**
 * @desc    Get candidate applications for a specific job listing
 * @route   GET /api/v1/jobs/:jobId/applications
 * @access  Private (Recruiter/Admin)
 */
export const getJobApplications = asyncHandler(async (req, res) => {
  const result = await applicationService.getJobApplications(
    req.params.jobId,
    req.user,
    req.query
  );
  return new ApiResponse(200, result.applications, 'Job applications retrieved successfully', {
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
  }).send(res);
});

export default {
  applyJob,
  getApplicationDetails,
  updateApplicationStatus,
  getCandidateApplications,
  getJobApplications,
};
