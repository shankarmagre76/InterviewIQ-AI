import resumeAnalysisService from './resumeAnalysis.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../middleware/async.middleware.js';

/**
 * @desc    Initiate AI Resume Analysis for logged-in user's active or specified resume
 * @route   POST /api/v1/profile/resume/analyze (also POST /api/v1/resumes/analyze)
 * @access  Private (JWT Protected)
 */
export const analyzeResume = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { resumeId, targetRole, experienceLevel, provider } = req.body;

  const analysis = await resumeAnalysisService.analyzeResume(userId, {
    resumeId,
    targetRole,
    experienceLevel,
    provider,
  });

  return new ApiResponse(201, analysis, 'Resume analyzed successfully by AI').send(res);
});

/**
 * @desc    Get candidate's latest active resume analysis report
 * @route   GET /api/v1/profile/resume/analysis/latest (also GET /api/v1/resumes/analysis/latest)
 * @access  Private (JWT Protected)
 */
export const getLatestAnalysis = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const analysis = await resumeAnalysisService.getLatestAnalysis(userId);

  return new ApiResponse(200, analysis, 'Latest resume analysis report retrieved successfully').send(res);
});

/**
 * @desc    Get complete resume analysis history for logged-in user
 * @route   GET /api/v1/profile/resume/analysis/history (also GET /api/v1/resumes/analysis/history)
 * @access  Private (JWT Protected)
 */
export const getAnalysisHistory = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const history = await resumeAnalysisService.getAnalysisHistory(userId);

  return new ApiResponse(200, history, 'Resume analysis history retrieved successfully').send(res);
});

/**
 * @desc    Get specific resume analysis report by ID
 * @route   GET /api/v1/profile/resume/analysis/:id (also GET /api/v1/resumes/analysis/:id)
 * @access  Private (JWT Protected)
 */
export const getAnalysisById = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { id } = req.params;

  const analysis = await resumeAnalysisService.getAnalysisById(userId, id);

  return new ApiResponse(200, analysis, 'Resume analysis report retrieved successfully').send(res);
});

/**
 * @desc    Delete specific resume analysis report by ID
 * @route   DELETE /api/v1/profile/resume/analysis/:id (also DELETE /api/v1/resumes/analysis/:id)
 * @access  Private (JWT Protected)
 */
export const deleteAnalysis = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { id } = req.params;

  const result = await resumeAnalysisService.deleteAnalysis(userId, id);

  return new ApiResponse(200, result, 'Resume analysis report deleted successfully').send(res);
});
