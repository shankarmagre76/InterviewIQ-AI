import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
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

export default router;

