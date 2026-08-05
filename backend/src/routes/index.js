import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import profileRoutes from '../profile/profile.routes.js';
import resumeRoutes from '../resume/resume.routes.js';
import { getRoot, getApiIndex } from '../controllers/health.controller.js';

const router = Router();

// Root path GET /
router.get('/', getRoot);

// Base API GET /api
router.get('/api', getApiIndex);

// Mount health and utility sub-routes under /api
router.use('/api', healthRoutes);

// Mount authentication sub-routes
router.use('/api/v1/auth', authRoutes);
router.use('/api/auth', authRoutes);

// Mount resume sub-routes (Mount before profile sub-routes to capture /profile/resume explicitly)
router.use('/api/v1/profile/resume', resumeRoutes);
router.use('/api/profile/resume', resumeRoutes);
router.use('/api/v1/resumes', resumeRoutes);
router.use('/api/resumes', resumeRoutes);

// Mount profile sub-routes
router.use('/api/v1/profile', profileRoutes);
router.use('/api/profile', profileRoutes);

export default router;
