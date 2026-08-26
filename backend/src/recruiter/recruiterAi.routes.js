import { Router } from 'express';
import authenticate from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';
import {
  matchCandidatesForJob,
  generateInterviewQuestions,
} from './recruiterAi.controller.js';

const router = Router();

// Protect Recruiter AI routes with JWT and Recruiter/Admin authorization
router.use(authenticate);
router.use(authorizeRoles('Recruiter', 'Admin'));

router.get('/match/:jobId', matchCandidatesForJob);
router.get('/questions/:jobId', generateInterviewQuestions);

export default router;
