import { Router } from 'express';
import {
  analyzeResume,
  getLatestAnalysis,
  getAnalysisHistory,
  getAnalysisById,
  deleteAnalysis,
} from './resumeAnalysis.controller.js';
import {
  validateAnalyzeResumeRequest,
  validateAnalysisIdParam,
} from './resumeAnalysis.validation.js';
import authenticate from '../middleware/auth.middleware.js';
import { aiRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

// Enforce JWT Authentication for all resume analysis endpoints
router.use(authenticate);

/**
 * @desc    Initiate AI Resume Analysis for candidate (Rate limited: 10 AI operations/hour)
 * @route   POST /api/v1/profile/resume/analyze (also /api/v1/resumes/analyze)
 * @access  Private (JWT Protected)
 */
router.post('/analyze', aiRateLimiter, validateAnalyzeResumeRequest, analyzeResume);

/**
 * @desc    Get candidate's latest active resume analysis report
 * @route   GET /api/v1/profile/resume/analysis (also /api/v1/resumes/analysis)
 * @access  Private (JWT Protected)
 */
router.get('/analysis', getLatestAnalysis);

/**
 * @desc    Get candidate's latest active resume analysis report (Alias route)
 * @route   GET /api/v1/profile/resume/analysis/latest (also /api/v1/resumes/analysis/latest)
 * @access  Private (JWT Protected)
 */
router.get('/analysis/latest', getLatestAnalysis);

/**
 * @desc    Get complete resume analysis history for candidate
 * @route   GET /api/v1/profile/resume/analysis/history (also /api/v1/resumes/analysis/history)
 * @access  Private (JWT Protected)
 */
router.get('/analysis/history', getAnalysisHistory);

/**
 * @desc    Get specific resume analysis report by ID
 * @route   GET /api/v1/profile/resume/analysis/:id (also /api/v1/resumes/analysis/:id)
 * @access  Private (JWT Protected)
 */
router.get('/analysis/:id', validateAnalysisIdParam, getAnalysisById);

/**
 * @desc    Delete specific resume analysis report by ID
 * @route   DELETE /api/v1/profile/resume/analysis/:id (also /api/v1/resumes/analysis/:id)
 * @access  Private (JWT Protected)
 */
router.delete('/analysis/:id', validateAnalysisIdParam, deleteAnalysis);

export default router;
