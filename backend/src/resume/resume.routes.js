import { Router } from 'express';
import {
  uploadResume,
  getResume,
  updateResume,
  deleteResume,
  getResumeHistory,
} from './resume.controller.js';
import {
  validateResumeFile,
  updateResumeMetadataValidation,
  resumeIdParamValidation,
} from './resume.validation.js';
import authenticate from '../middleware/auth.middleware.js';
import { handleResumeUpload } from '../middleware/upload.middleware.js';
import resumeAnalysisRoutes from './resumeAnalysis.routes.js';

const router = Router();

// Enforce JWT Authentication for all resume endpoints
router.use(authenticate);

// Mount AI Resume Analysis sub-router endpoints (/analyze, /analysis, /analysis/history, /analysis/:id)
router.use('/', resumeAnalysisRoutes);

/**
 * @desc    Upload new resume document (PDF only, max 5MB) or replace current active resume
 * @route   POST /api/v1/profile/resume (also /api/v1/resumes)
 * @access  Private (JWT Protected)
 * Middleware Stack:
 * 1. authenticate (JWT auth)
 * 2. handleResumeUpload('resume') (Multer multipart form parser with 5MB limit)
 * 3. validateResumeFile (Strict PDF MIME, extension, size & magic-bytes validator)
 * 4. uploadResume (Controller handler)
 */
router.post('/', handleResumeUpload('resume'), validateResumeFile, uploadResume);

/**
 * @desc    Get candidate's active resume details
 * @route   GET /api/v1/profile/resume (also /api/v1/resumes)
 * @access  Private (JWT Protected)
 */
router.get('/', getResume);

/**
 * @desc    Get complete resume upload history for candidate
 * @route   GET /api/v1/profile/resume/history (also /api/v1/resumes/history)
 * @access  Private (JWT Protected)
 */
router.get('/history', getResumeHistory);

/**
 * @desc    Replace resume document or update resume metadata
 * @route   PUT /api/v1/profile/resume
 * @access  Private (JWT Protected)
 */
router.put('/', handleResumeUpload('resume'), updateResume);

/**
 * @desc    Delete active resume document from Cloudinary storage and database
 * @route   DELETE /api/v1/profile/resume
 * @access  Private (JWT Protected)
 */
router.delete('/', deleteResume);

/**
 * @desc    Get specific resume document by ID
 * @route   GET /api/v1/profile/resume/:id
 * @access  Private (JWT Protected)
 */
router.get('/:id', resumeIdParamValidation, getResume);

/**
 * @desc    Update specific resume metadata by ID
 * @route   PUT /api/v1/profile/resume/:id
 * @access  Private (JWT Protected)
 */
router.put('/:id', resumeIdParamValidation, updateResumeMetadataValidation, updateResume);

/**
 * @desc    Delete specific resume document by ID
 * @route   DELETE /api/v1/profile/resume/:id
 * @access  Private (JWT Protected)
 */
router.delete('/:id', resumeIdParamValidation, deleteResume);

export default router;
