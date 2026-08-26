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
import authorizeRoles from '../middleware/role.middleware.js';
import { handleResumeUpload } from '../middleware/upload.middleware.js';
import resumeAnalysisRoutes from './resumeAnalysis.routes.js';

const router = Router();

// Enforce JWT Authentication for all resume endpoints
router.use(authenticate);

// Mount AI Resume Analysis sub-router endpoints (/analyze, /analysis, /analysis/history, /analysis/:id)
router.use('/', resumeAnalysisRoutes);

/**
 * Candidate / Student Routes
 */
router.post('/', authorizeRoles('Student', 'Admin'), handleResumeUpload('resume'), validateResumeFile, uploadResume);
router.get('/', authorizeRoles('Student', 'Admin'), getResume);
router.get('/history', authorizeRoles('Student', 'Admin'), getResumeHistory);
router.put('/', authorizeRoles('Student', 'Admin'), handleResumeUpload('resume'), updateResume);
router.delete('/', authorizeRoles('Student', 'Admin'), deleteResume);

/**
 * Specific Resume Routes (GET /:id allowed for Student, Recruiter, Admin)
 */
router.get('/:id', resumeIdParamValidation, getResume);
router.put('/:id', authorizeRoles('Student', 'Admin'), resumeIdParamValidation, updateResumeMetadataValidation, updateResume);
router.delete('/:id', authorizeRoles('Student', 'Admin'), resumeIdParamValidation, deleteResume);

export default router;
