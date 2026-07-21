import { Router } from 'express';
import { getHealth, getVersion } from '../controllers/health.controller.js';

const router = Router();

/**
 * @route GET /api/health
 */
router.get('/health', getHealth);

/**
 * @route GET /api/version
 */
router.get('/version', getVersion);

export default router;
