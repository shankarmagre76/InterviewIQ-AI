import recruiterAiService from './recruiterAi.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../middleware/async.middleware.js';
import ApiError from '../utils/ApiError.js';

export const matchCandidatesForJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const user = req.user;

  if (!jobId) {
    throw ApiError.badRequest('Job ID parameter is required');
  }

  const result = await recruiterAiService.matchCandidatesForJob(jobId, user);
  return new ApiResponse(200, result, 'Candidate matching analysis completed successfully').send(res);
});

export const generateInterviewQuestions = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const user = req.user;

  if (!jobId) {
    throw ApiError.badRequest('Job ID parameter is required');
  }

  const result = await recruiterAiService.generateInterviewQuestions(jobId, user);
  return new ApiResponse(200, result, 'Recruiter interview questions generated successfully').send(res);
});
