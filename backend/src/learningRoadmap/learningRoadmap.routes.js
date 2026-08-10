import { Router } from 'express';
import authenticate from '../middleware/auth.middleware.js';
import {
  generateRoadmap,
  getActiveRoadmap,
  getRoadmap,
  getRoadmapHistory,
  updateRoadmap,
  archiveRoadmap,
  deleteRoadmap,
  getTasks,
  updateTask,
  completeTask,
  skipTask,
  reopenTask,
} from './learningRoadmap.controller.js';
import {
  generateRoadmapValidation,
  roadmapIdParamValidation,
  taskIdParamValidation,
  updateRoadmapValidation,
  updateTaskValidation,
  roadmapHistoryValidation,
} from './learningRoadmap.validation.js';

const router = Router();

// Protect all Learning Roadmap routes with JWT Authentication
router.use(authenticate);

/* ==========================================================================
   ROADMAP ROUTES
   ========================================================================== */

// POST /api/v1/roadmaps/generate - Generate or Regenerate AI Learning Roadmap
router.post('/generate', generateRoadmapValidation, generateRoadmap);

// GET /api/v1/roadmaps/active - Retrieve candidate active roadmap
router.get('/active', getActiveRoadmap);

// GET /api/v1/roadmaps - Retrieve candidate roadmap history (Paginated)
router.get('/', roadmapHistoryValidation, getRoadmapHistory);

// GET /api/v1/roadmaps/:id - Retrieve specific roadmap by ID
router.get('/:id', roadmapIdParamValidation, getRoadmap);

// PATCH /api/v1/roadmaps/:id - Update roadmap properties
router.patch('/:id', updateRoadmapValidation, updateRoadmap);

// PATCH /api/v1/roadmaps/:id/archive - Archive an active roadmap
router.patch('/:id/archive', roadmapIdParamValidation, archiveRoadmap);

// DELETE /api/v1/roadmaps/:id - Delete roadmap and child tasks
router.delete('/:id', roadmapIdParamValidation, deleteRoadmap);

/* ==========================================================================
   LEARNING TASK ROUTES
   ========================================================================== */

// GET /api/v1/roadmaps/:id/tasks - Get tasks for a roadmap
router.get('/:id/tasks', roadmapIdParamValidation, getTasks);

// PATCH /api/v1/roadmaps/tasks/:taskId - Update task details
router.patch('/tasks/:taskId', updateTaskValidation, updateTask);

// PATCH /api/v1/roadmaps/tasks/:taskId/complete - Mark task as COMPLETED
router.patch('/tasks/:taskId/complete', taskIdParamValidation, completeTask);

// PATCH /api/v1/roadmaps/tasks/:taskId/skip - Mark task as SKIPPED
router.patch('/tasks/:taskId/skip', taskIdParamValidation, skipTask);

// PATCH /api/v1/roadmaps/tasks/:taskId/reopen - Reopen task
router.patch('/tasks/:taskId/reopen', taskIdParamValidation, reopenTask);

export default router;
