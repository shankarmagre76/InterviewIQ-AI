import { Router } from 'express';
import {
  startInterview,
  getInterviewHistory,
  getInterviewDetails,
  resumeInterview,
  endInterview,
  getQuestions,
  submitAnswer,
  getInterviewResult,
} from './interview.controller.js';
import {
  startInterviewValidation,
  interviewIdParamValidation,
  submitAnswerValidation,
} from './interview.validation.js';
import authenticate from '../middleware/auth.middleware.js';
import { aiRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

// Enforce JWT Authentication for all interview endpoints
router.use(authenticate);

/**
 * @desc    POST /api/v1/interviews & POST /api/v1/interviews/start (Rate limited: 10 AI operations/hour)
 *          Start a new AI Interview session and generate custom questions
 * @access  Private (JWT Protected)
 */
router.post('/', aiRateLimiter, startInterviewValidation, startInterview);
router.post('/start', aiRateLimiter, startInterviewValidation, startInterview);

/**
 * @desc    GET /api/v1/interviews
 *          Get candidate's past interview session history
 * @access  Private (JWT Protected)
 */
router.get('/', getInterviewHistory);

/**
 * @desc    GET /api/v1/interviews/:id
 *          Get full details of a specific interview session (session, questions, result)
 * @access  Private (JWT Protected)
 */
router.get('/:id', interviewIdParamValidation, getInterviewDetails);

/**
 * @desc    DELETE /api/v1/interviews/:id
 *          Delete / cancel an interview session
 * @access  Private (JWT Protected)
 */
router.delete('/:id', interviewIdParamValidation, endInterview);

/**
 * @desc    POST /api/v1/interviews/:id/questions & GET /api/v1/interviews/:id/questions
 *          Fetch active question set or regenerate questions for an interview session
 * @access  Private (JWT Protected)
 */
router.get('/:id/questions', interviewIdParamValidation, getQuestions);
router.post('/:id/questions', interviewIdParamValidation, getQuestions);

/**
 * @desc    POST /api/v1/interviews/:id/answer
 *          Submit audio/text answer for an interview question
 * @access  Private (JWT Protected)
 */
router.post('/:id/answer', interviewIdParamValidation, submitAnswerValidation, submitAnswer);

/**
 * @desc    POST /api/v1/interviews/:id/complete & POST /api/v1/interviews/:id/finish
 *          End an active interview session and generate AI feedback report
 * @access  Private (JWT Protected)
 */
router.post('/:id/complete', interviewIdParamValidation, endInterview);
router.post('/:id/finish', interviewIdParamValidation, endInterview);

/**
 * @desc    GET /api/v1/interviews/:id/result
 *          Fetch interview result evaluation report
 * @access  Private (JWT Protected)
 */
router.get('/:id/result', interviewIdParamValidation, getInterviewResult);

export default router;
