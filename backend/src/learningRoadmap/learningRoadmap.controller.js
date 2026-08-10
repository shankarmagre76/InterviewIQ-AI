import asyncHandler from '../middleware/async.middleware.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import roadmapService from './roadmap.service.js';
import learningProgressService from './learningProgress.service.js';
import learningTaskRepository from './learningRoadmap.repository.js';

/**
 * Learning Roadmap & Task Controller Layer
 * Handles HTTP requests, extracts parameters, delegates to RoadmapService & LearningProgressService,
 * and sends standardized HTTP responses via ApiResponse.
 * Contains ZERO business logic.
 */

/**
 * @desc    POST /api/v1/roadmaps/generate
 *          Generate or regenerate a personalized AI Learning Roadmap
 * @access  Private (JWT Protected)
 */
export const generateRoadmap = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User authentication required');
  }

  const { targetRole, forceRegenerate } = req.body;

  const result = await roadmapService.generateRoadmap(userId, {
    targetRole,
    forceRegenerate,
  });

  return new ApiResponse(
    201,
    result,
    'AI Learning Roadmap generated successfully'
  ).send(res);
});

/**
 * @desc    GET /api/v1/roadmaps/active
 *          Retrieve candidate's currently active Learning Roadmap
 * @access  Private (JWT Protected)
 */
export const getActiveRoadmap = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User authentication required');
  }

  const result = await roadmapService.getActiveRoadmap(userId);

  return new ApiResponse(
    200,
    result,
    'Active Learning Roadmap retrieved successfully'
  ).send(res);
});

/**
 * @desc    GET /api/v1/roadmaps/:id
 *          Retrieve specific Learning Roadmap by ID
 * @access  Private (JWT Protected)
 */
export const getRoadmap = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User authentication required');
  }

  const { id } = req.params;
  const result = await roadmapService.getRoadmap(id, userId);

  return new ApiResponse(
    200,
    result,
    'Learning Roadmap retrieved successfully'
  ).send(res);
});

/**
 * @desc    GET /api/v1/roadmaps
 *          Retrieve candidate's historical Learning Roadmaps (Paginated)
 * @access  Private (JWT Protected)
 */
export const getRoadmapHistory = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User authentication required');
  }

  const { page = 1, limit = 10, status = null } = req.query;

  const result = await roadmapService.getRoadmapHistory(userId, {
    page: Number(page),
    limit: Number(limit),
    status,
  });

  return new ApiResponse(
    200,
    result,
    'Roadmap history retrieved successfully'
  ).send(res);
});

/**
 * @desc    PATCH /api/v1/roadmaps/:id
 *          Update Learning Roadmap properties
 * @access  Private (JWT Protected)
 */
export const updateRoadmap = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User authentication required');
  }

  const { id } = req.params;
  const updatedRoadmap = await roadmapService.updateRoadmap(id, userId, req.body);

  return new ApiResponse(
    200,
    updatedRoadmap,
    'Learning Roadmap updated successfully'
  ).send(res);
});

/**
 * @desc    PATCH /api/v1/roadmaps/:id/archive
 *          Archive an active Learning Roadmap
 * @access  Private (JWT Protected)
 */
export const archiveRoadmap = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User authentication required');
  }

  const { id } = req.params;
  const archivedRoadmap = await roadmapService.archiveRoadmap(id, userId);

  return new ApiResponse(
    200,
    archivedRoadmap,
    'Learning Roadmap archived successfully'
  ).send(res);
});

/**
 * @desc    DELETE /api/v1/roadmaps/:id
 *          Delete a Learning Roadmap and cascade-delete child tasks
 * @access  Private (JWT Protected)
 */
export const deleteRoadmap = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User authentication required');
  }

  const { id } = req.params;
  const result = await roadmapService.deleteRoadmap(id, userId);

  return new ApiResponse(
    200,
    result,
    'Learning Roadmap deleted successfully'
  ).send(res);
});

/* ==========================================================================
   TASK CONTROLLERS
   ========================================================================== */

/**
 * @desc    GET /api/v1/roadmaps/:id/tasks
 *          Retrieve tasks associated with a Learning Roadmap
 * @access  Private (JWT Protected)
 */
export const getTasks = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User authentication required');
  }

  const { id: roadmapId } = req.params;
  const { phaseId = null, status = null } = req.query;

  const tasks = await learningTaskRepository.getRoadmapTasks(roadmapId, userId, {
    phaseId,
    status,
  });

  return new ApiResponse(
    200,
    tasks,
    'Roadmap tasks retrieved successfully'
  ).send(res);
});

/**
 * @desc    PATCH /api/v1/roadmaps/tasks/:taskId
 *          Update properties of an individual Learning Task
 * @access  Private (JWT Protected)
 */
export const updateTask = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User authentication required');
  }

  const { taskId } = req.params;
  const updatedTask = await learningTaskRepository.updateTask(
    taskId,
    userId,
    req.body
  );

  if (!updatedTask) {
    throw ApiError.notFound('Learning task not found or access denied');
  }

  return new ApiResponse(
    200,
    updatedTask,
    'Learning task updated successfully'
  ).send(res);
});

/**
 * @desc    PATCH /api/v1/roadmaps/tasks/:taskId/complete
 *          Mark task as COMPLETED and recalculate roadmap progress
 * @access  Private (JWT Protected)
 */
export const completeTask = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User authentication required');
  }

  const { taskId } = req.params;
  const result = await learningProgressService.completeTask(taskId, userId);

  return new ApiResponse(
    200,
    result,
    'Learning task completed successfully'
  ).send(res);
});

/**
 * @desc    PATCH /api/v1/roadmaps/tasks/:taskId/skip
 *          Mark task as SKIPPED and recalculate roadmap progress
 * @access  Private (JWT Protected)
 */
export const skipTask = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User authentication required');
  }

  const { taskId } = req.params;
  const result = await learningProgressService.skipTask(taskId, userId);

  return new ApiResponse(
    200,
    result,
    'Learning task skipped'
  ).send(res);
});

/**
 * @desc    PATCH /api/v1/roadmaps/tasks/:taskId/reopen
 *          Reopen a completed task and adjust roadmap progress downwards
 * @access  Private (JWT Protected)
 */
export const reopenTask = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User authentication required');
  }

  const { taskId } = req.params;
  const result = await learningProgressService.reopenTask(taskId, userId);

  return new ApiResponse(
    200,
    result,
    'Learning task reopened'
  ).send(res);
});
