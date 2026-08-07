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

const router = Router();

// Enforce JWT Authentication for all interview endpoints
router.use(authenticate);

/**
 * @desc    POST /api/v1/interviews & POST /api/v1/interviews/start
 *          Start a new AI Interview session and generate custom questions
 * @access  Private (JWT Protected)
 */
router.post('/', startInterviewValidation, startInterview);
router.post('/start', startInterviewValidation, startInterview);

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
 * @desc    POST /api/v1/interviews/:id/answers & POST /api/v1/interviews/:id/questions/:questionId/answer
 *          Submit candidate answer for AI evaluation and update session progress
 * @access  Private (JWT Protected)
 */
router.post('/:id/answers', submitAnswerValidation, (req, res, next) => {
  if (!req.params.questionId && req.body.questionId) {
    req.params.questionId = req.body.questionId;
  }
  return submitAnswer(req, res, next);
});
router.post('/:id/questions/:questionId/answer', submitAnswerValidation, submitAnswer);

/**
 * @desc    GET /api/v1/interviews/:id/result
 *          Get evaluation report for a completed interview session
 * @access  Private (JWT Protected)
 */
router.get('/:id/result', interviewIdParamValidation, getInterviewResult);

/**
 * @desc    POST /api/v1/interviews/:id/resume
 *          Resume an in-progress or interrupted interview session
 * @access  Private (JWT Protected)
 */
router.post('/:id/resume', interviewIdParamValidation, resumeInterview);
router.get('/:id/resume', interviewIdParamValidation, resumeInterview);

/**
 * @desc    POST /api/v1/interviews/:id/end
 *          Conclude or cancel an interview session
 * @access  Private (JWT Protected)
 */
router.post('/:id/end', interviewIdParamValidation, endInterview);

export default router;
