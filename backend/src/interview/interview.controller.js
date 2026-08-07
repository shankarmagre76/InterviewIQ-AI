import interviewService from './interview.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../middleware/async.middleware.js';
import ApiError from '../utils/ApiError.js';

/**
 * Controller Layer for Interview Module
 * Receives HTTP requests, validates request parameters, delegates to InterviewService,
 * and returns standardized ApiResponse objects. Contains ZERO business logic.
 */

/**
 * @desc    Start a new AI Interview session and generate custom questions
 * @route   POST /api/v1/interviews/start
 * @access  Private (JWT Protected)
 */
export const startInterview = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User authentication required');
  }

  const session = await interviewService.startInterview(userId, req.body);
  return new ApiResponse(201, session, 'Interview session started successfully').send(res);
});

/**
 * @desc    Get candidate's past interview session history with pagination
 * @route   GET /api/v1/interviews
 * @access  Private (JWT Protected)
 */
export const getInterviewHistory = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User authentication required');
  }

  const history = await interviewService.getUserInterviewHistory(userId, req.query);
  return new ApiResponse(200, history, 'Interview history retrieved successfully').send(res);
});

/**
 * @desc    Get full interview session details (session, questions, evaluation result)
 * @route   GET /api/v1/interviews/:id
 * @access  Private (JWT Protected)
 */
export const getInterviewDetails = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { id } = req.params;

  if (!id) {
    throw ApiError.badRequest('Interview ID parameter is required');
  }

  const details = await interviewService.getInterviewDetails(userId, id);
  return new ApiResponse(200, details, 'Interview details retrieved successfully').send(res);
});

/**
 * @desc    Resume an in-progress or interrupted interview session
 * @route   POST /api/v1/interviews/:id/resume (or GET /api/v1/interviews/:id/resume)
 * @access  Private (JWT Protected)
 */
export const resumeInterview = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { id } = req.params;

  if (!id) {
    throw ApiError.badRequest('Interview ID parameter is required');
  }

  const resumedState = await interviewService.resumeInterview(userId, id);
  return new ApiResponse(200, resumedState, 'Interview session resumed successfully').send(res);
});

/**
 * @desc    Conclude or cancel an active interview session
 * @route   POST /api/v1/interviews/:id/end
 * @access  Private (JWT Protected)
 */
export const endInterview = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { id } = req.params;
  const { status = 'Completed' } = req.body;

  if (!id) {
    throw ApiError.badRequest('Interview ID parameter is required');
  }

  const result = await interviewService.endInterview(userId, id, status);
  return new ApiResponse(200, result, 'Interview session concluded successfully').send(res);
});

/**
 * @desc    Get questions list for a specific interview session
 * @route   GET /api/v1/interviews/:id/questions
 * @access  Private (JWT Protected)
 */
export const getQuestions = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { id } = req.params;

  if (!id) {
    throw ApiError.badRequest('Interview ID parameter is required');
  }

  const details = await interviewService.getInterviewDetails(userId, id);
  return new ApiResponse(200, details.questions, 'Interview questions retrieved successfully').send(res);
});

/**
 * @desc    Submit a candidate answer for evaluation by Gemini AI
 * @route   POST /api/v1/interviews/:id/questions/:questionId/answer
 * @access  Private (JWT Protected)
 */
export const submitAnswer = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { id, questionId } = req.params;
  const userAnswer = req.body.answer || req.body.userAnswer || '';

  if (!id || !questionId) {
    throw ApiError.badRequest('Interview ID and Question ID parameters are required');
  }

  const evalResult = await interviewService.receiveAnswers(userId, id, questionId, userAnswer);
  return new ApiResponse(200, evalResult, 'Answer submitted and evaluated successfully').send(res);
});

/**
 * @desc    Get composite evaluation result report for a completed interview
 * @route   GET /api/v1/interviews/:id/result
 * @access  Private (JWT Protected)
 */
export const getInterviewResult = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { id } = req.params;

  if (!id) {
    throw ApiError.badRequest('Interview ID parameter is required');
  }

  const details = await interviewService.getInterviewDetails(userId, id);
  if (!details.result) {
    throw ApiError.notFound(`Evaluation result not yet generated for interview session ${id}`);
  }

  return new ApiResponse(200, details.result, 'Interview evaluation result retrieved successfully').send(res);
});
