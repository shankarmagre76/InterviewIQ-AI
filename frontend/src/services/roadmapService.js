import { api } from './api';
import { API_ENDPOINTS } from '../constants/appConstants';

export const roadmapService = {
  async generateRoadmap(config = {}) {
    const response = await api.post(API_ENDPOINTS.ROADMAP.GENERATE, config);
    return response.data;
  },

  async getActiveRoadmap() {
    const response = await api.get(API_ENDPOINTS.ROADMAP.ACTIVE);
    return response.data;
  },

  async getRoadmapHistory(params = {}) {
    const response = await api.get(API_ENDPOINTS.ROADMAP.BASE, { params });
    return response.data;
  },

  async getRoadmapById(id) {
    const response = await api.get(API_ENDPOINTS.ROADMAP.BY_ID(id));
    return response.data;
  },

  async updateRoadmap(id, data) {
    const response = await api.patch(API_ENDPOINTS.ROADMAP.BY_ID(id), data);
    return response.data;
  },

  async archiveRoadmap(id) {
    const response = await api.patch(API_ENDPOINTS.ROADMAP.ARCHIVE(id));
    return response.data;
  },

  async deleteRoadmap(id) {
    const response = await api.delete(API_ENDPOINTS.ROADMAP.BY_ID(id));
    return response.data;
  },

  // Task sub-resources
  async getTasks(roadmapId) {
    const response = await api.get(API_ENDPOINTS.ROADMAP.TASKS(roadmapId));
    return response.data;
  },

  async updateTask(taskId, taskData) {
    const response = await api.patch(API_ENDPOINTS.ROADMAP.TASK_BY_ID(taskId), taskData);
    return response.data;
  },

  async startTask(taskId) {
    const response = await api.patch(API_ENDPOINTS.ROADMAP.TASK_START(taskId));
    return response.data;
  },

  async completeTask(taskId) {
    const response = await api.patch(API_ENDPOINTS.ROADMAP.TASK_COMPLETE(taskId));
    return response.data;
  },

  async skipTask(taskId) {
    const response = await api.patch(API_ENDPOINTS.ROADMAP.TASK_SKIP(taskId));
    return response.data;
  },

  async reopenTask(taskId) {
    const response = await api.patch(API_ENDPOINTS.ROADMAP.TASK_REOPEN(taskId));
    return response.data;
  },
};

export default roadmapService;
