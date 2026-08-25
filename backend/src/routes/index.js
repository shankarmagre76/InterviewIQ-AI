import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import profileRoutes from '../profile/profile.routes.js';
import resumeRoutes from '../resume/resume.routes.js';
import companyRoutes from '../company/company.routes.js';
import jobRoutes from '../job/job.routes.js';
import applicationRoutes from '../application/application.routes.js';
import savedJobRoutes from '../savedJob/savedJob.routes.js';
import interviewRoutes from '../interview/interview.routes.js';
import dashboardRoutes from '../dashboard/dashboard.routes.js';
import learningRoadmapRoutes from '../learningRoadmap/learningRoadmap.routes.js';
import notificationRoutes from '../notification/notification.routes.js';
import adminRoutes from '../admin/admin.routes.js';
import recruiterAiRoutes from '../recruiter/recruiterAi.routes.js';
import { getRoot, getApiIndex } from '../controllers/health.controller.js';

const router = Router();

// Root path GET /
router.get('/', getRoot);

// Base API GET /api
router.get('/api', getApiIndex);

// Mount health and utility sub-routes under /api
router.use('/api', healthRoutes);

// Mount authentication sub-routes (supports /auth, /api/v1/auth, /api/auth)
router.use('/auth', authRoutes);
router.use('/api/v1/auth', authRoutes);
router.use('/api/auth', authRoutes);

// Mount resume sub-routes (Mount before profile sub-routes to capture /profile/resume explicitly)
router.use('/profile/resume', resumeRoutes);
router.use('/resumes', resumeRoutes);
router.use('/api/v1/profile/resume', resumeRoutes);
router.use('/api/profile/resume', resumeRoutes);
router.use('/api/v1/resumes', resumeRoutes);
router.use('/api/resumes', resumeRoutes);

// Mount profile sub-routes
router.use('/profile', profileRoutes);
router.use('/api/v1/profile', profileRoutes);
router.use('/api/profile', profileRoutes);

// Mount Company sub-routes
router.use('/companies', companyRoutes);
router.use('/api/v1/companies', companyRoutes);
router.use('/api/companies', companyRoutes);

// Mount Job sub-routes
router.use('/jobs', jobRoutes);
router.use('/api/v1/jobs', jobRoutes);
router.use('/api/jobs', jobRoutes);

// Mount Application sub-routes
router.use('/applications', applicationRoutes);
router.use('/api/v1/applications', applicationRoutes);
router.use('/api/applications', applicationRoutes);

// Mount Saved Job sub-routes
router.use('/saved-jobs', savedJobRoutes);
router.use('/api/v1/saved-jobs', savedJobRoutes);
router.use('/api/saved-jobs', savedJobRoutes);

// Mount Interview sub-routes
router.use('/interviews', interviewRoutes);
router.use('/api/v1/interviews', interviewRoutes);
router.use('/api/interviews', interviewRoutes);

// Mount Dashboard sub-routes
router.use('/dashboard', dashboardRoutes);
router.use('/api/v1/dashboard', dashboardRoutes);
router.use('/api/dashboard', dashboardRoutes);

// Mount Learning Roadmap sub-routes
router.use('/roadmaps', learningRoadmapRoutes);
router.use('/api/v1/roadmaps', learningRoadmapRoutes);
router.use('/api/roadmaps', learningRoadmapRoutes);

// Mount Notification sub-routes
router.use('/notifications', notificationRoutes);
router.use('/api/v1/notifications', notificationRoutes);
router.use('/api/notifications', notificationRoutes);

// Mount Recruiter AI sub-routes
router.use('/recruiter/ai', recruiterAiRoutes);
router.use('/api/v1/recruiter/ai', recruiterAiRoutes);
router.use('/api/recruiter/ai', recruiterAiRoutes);

// Mount Admin sub-routes
router.use('/admin', adminRoutes);
router.use('/api/v1/admin', adminRoutes);
router.use('/api/admin', adminRoutes);

export default router;
