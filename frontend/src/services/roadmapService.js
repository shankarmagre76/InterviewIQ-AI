import { api } from './api.js';
import { API_ENDPOINTS } from '../constants/appConstants.js';

/**
 * Roadmap Service Layer
 * Interacts with backend API routes under /api/v1/roadmaps
 * Handles roadmap generation, retrieval, history, updates, archiving, deletion,
 * and task status management (start, complete, skip, reopen).
 */
export const roadmapService = {
  /**
   * Generate or regenerate AI Learning Roadmap
   * POST /api/v1/roadmaps/generate
   * @param {object|string} config - Options payload { targetRole, forceRegenerate } or string targetRole
   */
  async generateRoadmap(config = {}) {
    const payload = typeof config === 'string' ? { targetRole: config } : config;
    const response = await api.post(API_ENDPOINTS.ROADMAP.GENERATE, payload);
    return response.data;
  },

  /**
   * Get candidate active learning roadmap
   * GET /api/v1/roadmaps/active
   */
  async getActiveRoadmap() {
    const response = await api.get(API_ENDPOINTS.ROADMAP.ACTIVE);
    return response.data;
  },

  /**
   * Get roadmap by ID
   * GET /api/v1/roadmaps/:id
   * @param {string} id - Roadmap ObjectId
   */
  async getRoadmapById(id) {
    const response = await api.get(API_ENDPOINTS.ROADMAP.BY_ID(id));
    return response.data;
  },

  /**
   * Alias for getRoadmapById
   */
  async getRoadmap(id) {
    return this.getRoadmapById(id);
  },

  /**
   * Get candidate roadmap history (Paginated)
   * GET /api/v1/roadmaps
   * @param {object} params - Query params { page, limit, status }
   */
  async getRoadmapHistory(params = {}) {
    const response = await api.get(API_ENDPOINTS.ROADMAP.BASE, { params });
    return response.data;
  },

  /**
   * Alias for getRoadmapHistory
   */
  async getHistory(params = {}) {
    return this.getRoadmapHistory(params);
  },

  /**
   * Update roadmap properties
   * PATCH /api/v1/roadmaps/:id
   * @param {string} id - Roadmap ObjectId
   * @param {object} data - Update body { title, description, status }
   */
  async updateRoadmap(id, data) {
    const response = await api.patch(API_ENDPOINTS.ROADMAP.BY_ID(id), data);
    return response.data;
  },

  /**
   * Archive active roadmap
   * PATCH /api/v1/roadmaps/:id/archive
   * @param {string} id - Roadmap ObjectId
   */
  async archiveRoadmap(id) {
    const response = await api.patch(API_ENDPOINTS.ROADMAP.ARCHIVE(id));
    return response.data;
  },

  /**
   * Delete roadmap and child tasks
   * DELETE /api/v1/roadmaps/:id
   * @param {string} id - Roadmap ObjectId
   */
  async deleteRoadmap(id) {
    const response = await api.delete(API_ENDPOINTS.ROADMAP.BY_ID(id));
    return response.data;
  },

  /* ==========================================================================
     LEARNING TASK SUB-RESOURCES
     ========================================================================== */

  /**
   * Get tasks associated with a roadmap
   * GET /api/v1/roadmaps/:id/tasks
   * @param {string} roadmapId - Roadmap ObjectId
   * @param {object} params - Query params { phaseId, status }
   */
  async getRoadmapTasks(roadmapId, params = {}) {
    const response = await api.get(API_ENDPOINTS.ROADMAP.TASKS(roadmapId), { params });
    return response.data;
  },

  /**
   * Alias for getRoadmapTasks
   */
  async getTasks(roadmapId, params = {}) {
    return this.getRoadmapTasks(roadmapId, params);
  },

  /**
   * Update individual task properties
   * PATCH /api/v1/roadmaps/tasks/:taskId
   * @param {string} taskId - Task ObjectId
   * @param {object} taskData - Update payload { title, type, priority, status, estimatedMinutes }
   */
  async updateTask(taskId, taskData) {
    const response = await api.patch(API_ENDPOINTS.ROADMAP.TASK_BY_ID(taskId), taskData);
    return response.data;
  },

  /**
   * Start a learning task (transition status to IN_PROGRESS)
   * PATCH /api/v1/roadmaps/tasks/:taskId/start
   * @param {string} taskId - Task ObjectId
   */
  async startTask(taskId) {
    const response = await api.patch(API_ENDPOINTS.ROADMAP.TASK_START(taskId));
    return response.data;
  },

  /**
   * Mark task as completed and recalculate progress
   * PATCH /api/v1/roadmaps/tasks/:taskId/complete
   * @param {string} taskId - Task ObjectId
   */
  async completeTask(taskId) {
    const response = await api.patch(API_ENDPOINTS.ROADMAP.TASK_COMPLETE(taskId));
    return response.data;
  },

  /**
   * Mark task as skipped
   * PATCH /api/v1/roadmaps/tasks/:taskId/skip
   * @param {string} taskId - Task ObjectId
   */
  async skipTask(taskId) {
    const response = await api.patch(API_ENDPOINTS.ROADMAP.TASK_SKIP(taskId));
    return response.data;
  },

  /**
   * Reopen a completed task
   * PATCH /api/v1/roadmaps/tasks/:taskId/reopen
   * @param {string} taskId - Task ObjectId
   */
  async reopenTask(taskId) {
    const response = await api.patch(API_ENDPOINTS.ROADMAP.TASK_REOPEN(taskId));
    return response.data;
  },

  /**
   * Helper utility to retrieve progress for a roadmap
   * @param {string} [roadmapId] - Roadmap ObjectId (Optional: if omitted, fetches active roadmap)
   */
  async getProgress(roadmapId) {
    const res = roadmapId ? await this.getRoadmapById(roadmapId) : await this.getActiveRoadmap();
    const data = res?.data || {};
    const roadmap = data.roadmap || (data._id ? data : null);

    return {
      overallProgress: roadmap?.overallProgress ?? 0,
      status: roadmap?.status || 'ACTIVE',
      phases: roadmap?.phases || [],
    };
  },
};

export default roadmapService;
