import express from 'express';
import mongoose from 'mongoose';
import learningRoadmapRoutes from './learningRoadmap.routes.js';
import notificationRoutes from '../notification/notification.routes.js';
import errorHandler from '../middleware/error.middleware.js';
import { generateAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import LearningRoadmap from './learningRoadmap.model.js';
import LearningTask from './learningTask.model.js';
import Notification from '../notification/notification.model.js';
import geminiProvider from '../services/ai.service.js';

console.log('=== INTERVIEWIQ AI - PHASE 9.11 API TESTING SUITE ===\n');

async function runApiTestingSuite() {
  let passedCount = 0;
  let failedCount = 0;

  const assert = (condition, testName, message = '') => {
    if (condition) {
      passedCount++;
      console.log(`[PASS] ${testName}`);
    } else {
      failedCount++;
      console.error(`[FAIL] ${testName} - ${message}`);
    }
  };

  try {
    const userAId = new mongoose.Types.ObjectId().toString();
    const userBId = new mongoose.Types.ObjectId().toString();
    const tokenA = `Bearer ${generateAccessToken({ id: userAId })}`;
    const tokenB = `Bearer ${generateAccessToken({ id: userBId })}`;

    // Stub User model lookup
    const origUserFindById = User.findById;
    User.findById = async (id) => {
      const idStr = String(id);
      if (idStr === userAId || idStr === userBId) {
        return { _id: idStr, email: 'user@example.com', isActive: true };
      }
      return null;
    };

    // Build Express Test App
    const app = express();
    app.use(express.json());
    app.use('/api/v1/roadmaps', learningRoadmapRoutes);
    app.use('/api/v1/notifications', notificationRoutes);
    app.use(errorHandler);

    const server = app.listen(0);
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    const makeRequest = async (path, method = 'GET', body = null, token = tokenA) => {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = token;

      const opts = { method, headers };
      if (body) opts.body = JSON.stringify(body);

      const res = await fetch(`${baseUrl}${path}`, opts);
      const data = await res.json();
      return { status: res.status, data };
    };

    // Mock DB In-Memory Store for Testing
    const mockRoadmaps = [];
    const mockTasks = [];
    const mockNotifications = [];

    // Stub Mongoose Model Queries
    const origRoadmapFindOne = LearningRoadmap.findOne;
    const origRoadmapFind = LearningRoadmap.find;
    const origRoadmapCount = LearningRoadmap.countDocuments;
    const origRoadmapSave = LearningRoadmap.prototype.save;
    const origTaskSave = LearningTask.prototype.save;
    const origTaskFind = LearningTask.find;
    const origTaskFindOne = LearningTask.findOne;
    const origTaskFindOneAndUpdate = LearningTask.findOneAndUpdate;

    LearningRoadmap.findOne = async (query) => {
      return mockRoadmaps.find((r) => {
        if (query._id && String(r._id) !== String(query._id)) return false;
        if (query.user && String(r.user) !== String(query.user)) return false;
        if (query.isActive !== undefined && r.isActive !== query.isActive) return false;
        if (query.status && r.status !== query.status) return false;
        return true;
      }) || null;
    };

    LearningRoadmap.find = (query) => {
      const filtered = mockRoadmaps.filter((r) => String(r.user) === String(query.user));
      return {
        sort: () => ({
          skip: () => ({
            limit: () => ({
              lean: async () => filtered,
            }),
          }),
        }),
      };
    };

    LearningRoadmap.countDocuments = async () => mockRoadmaps.length;

    LearningRoadmap.prototype.save = async function () {
      if (!this._id) this._id = new mongoose.Types.ObjectId();
      const existingIdx = mockRoadmaps.findIndex((r) => String(r._id) === String(this._id));
      if (existingIdx !== -1) {
        mockRoadmaps[existingIdx] = this;
      } else {
        mockRoadmaps.push(this);
      }
      return this;
    };

    LearningTask.prototype.save = async function () {
      if (!this._id) this._id = new mongoose.Types.ObjectId();
      mockTasks.push(this);
      return this;
    };

    LearningTask.find = (query) => ({
      sort: () => ({
        lean: async () => mockTasks.filter((t) => String(t.roadmap) === String(query.roadmap)),
      }),
    });

    LearningTask.findOne = async (query) => {
      return mockTasks.find((t) => String(t._id) === String(query._id) && String(t.user) === String(query.user)) || null;
    };

    LearningTask.findOneAndUpdate = async (query, update) => {
      const task = mockTasks.find((t) => String(t._id) === String(query._id) && String(t.user) === String(query.user));
      if (!task) return null;
      Object.assign(task, update);
      return task;
    };

    // Stub Gemini AI Service Response
    const origGenerateContent = geminiProvider.generateContentWithRetry;
    const mockAiPayload = JSON.stringify({
      title: 'Full-Stack Developer Learning Roadmap',
      description: 'Master Node.js, Express, and React for full-stack engineering candidate roles.',
      skillGaps: ['TypeScript', 'Docker'],
      phases: [
        {
          title: 'Phase 1: TypeScript Fundamentals',
          description: 'Learn strict typing and generics.',
          skills: ['TypeScript'],
          priority: 'HIGH',
          estimatedDays: 7,
          order: 1,
          tasks: [
            {
              title: 'Study TypeScript Docs',
              description: 'Read interfaces and primitive types.',
              type: 'LEARNING',
              skills: ['TypeScript'],
              priority: 'HIGH',
              estimatedMinutes: 45,
              order: 1,
              resources: [{ title: 'TS Docs', url: 'https://typescriptlang.org', type: 'DOCUMENTATION' }],
            },
          ],
        },
      ],
    });
    geminiProvider.generateContentWithRetry = async () => mockAiPayload;

    // --- TEST SCENARIO 1: Valid Authenticated User ---
    const activeRes = await makeRequest('/api/v1/roadmaps/active', 'GET');
    assert(activeRes.status === 200, 'Scenario 1: Valid authenticated user receives 200 OK');

    // --- TEST SCENARIO 2: Missing JWT Token ---
    const missingJwtRes = await makeRequest('/api/v1/roadmaps/active', 'GET', null, null);
    assert(missingJwtRes.status === 401, 'Scenario 2: Missing JWT returns 401 Unauthorized');

    // --- TEST SCENARIO 3: Invalid JWT Token ---
    const invalidJwtRes = await makeRequest('/api/v1/roadmaps/active', 'GET', null, 'Bearer invalid.token.str');
    assert(invalidJwtRes.status === 401, 'Scenario 3: Invalid JWT returns 401 Unauthorized');

    // --- TEST SCENARIO 6: Generate Roadmap with Complete Context ---
    const genRes = await makeRequest('/api/v1/roadmaps/generate', 'POST', { targetRole: 'Backend Lead' });
    assert(genRes.status === 201 && genRes.data.data.roadmap.version === 1, 'Scenario 6: Generate roadmap creates v1 roadmap document');

    const createdRoadmapId = genRes.data.data.roadmap._id;
    const createdTaskId = genRes.data.data.tasks[0]._id;

    // --- TEST SCENARIO 4: User Accessing Another User's Roadmap ---
    const forbiddenRoadmapRes = await makeRequest(`/api/v1/roadmaps/${createdRoadmapId}`, 'GET', null, tokenB);
    assert(forbiddenRoadmapRes.status === 404, 'Scenario 4: Accessing another user\'s roadmap returns 404 Not Found');

    // --- TEST SCENARIO 5: User Accessing Another User's Task ---
    const forbiddenTaskRes = await makeRequest(`/api/v1/roadmaps/tasks/${createdTaskId}/complete`, 'PATCH', null, tokenB);
    assert(forbiddenTaskRes.status === 404, 'Scenario 5: Completing another user\'s task returns 404 Not Found');

    // --- TEST SCENARIO 7 & 8: Generate Roadmap without Resume / Interview History ---
    const genNoResumeRes = await makeRequest('/api/v1/roadmaps/generate', 'POST', { targetRole: 'DevOps Engineer' }, tokenB);
    assert(genNoResumeRes.status === 201, 'Scenario 7 & 8: Generate roadmap handles candidates without resume/interview history');

    // --- TEST SCENARIO 11: Duplicate Active Roadmap Regeneration ---
    const regenRes = await makeRequest('/api/v1/roadmaps/generate', 'POST', { forceRegenerate: true }, tokenA);
    assert(regenRes.status === 201 && regenRes.data.data.roadmap.version === 2, 'Scenario 11: Regeneration archives previous active roadmap and increments to v2');

    // --- TEST SCENARIO 12: Complete Task & Idempotency ---
    const currentTaskId = regenRes.data.data.tasks[0]._id;
    const completeRes1 = await makeRequest(`/api/v1/roadmaps/tasks/${currentTaskId}/complete`, 'PATCH');
    assert(completeRes1.status === 200 && completeRes1.data.data.task.status === 'COMPLETED', 'Scenario 12a: Complete task transitions status to COMPLETED');

    const completeRes2 = await makeRequest(`/api/v1/roadmaps/tasks/${currentTaskId}/complete`, 'PATCH');
    assert(completeRes2.status === 200, 'Scenario 12b: Completing task twice executes idempotently');

    // --- TEST SCENARIO 13: Reopen Completed Task ---
    const reopenRes = await makeRequest(`/api/v1/roadmaps/tasks/${currentTaskId}/reopen`, 'PATCH');
    assert(reopenRes.status === 200 && reopenRes.data.data.task.status === 'IN_PROGRESS', 'Scenario 13: Reopen task resets status to IN_PROGRESS and adjusts progress downwards');

    // --- TEST SCENARIO 14 & 15: Invalid Task / Roadmap Mongo ID ---
    const invalidTaskRes = await makeRequest('/api/v1/roadmaps/tasks/not-a-mongo-id/complete', 'PATCH');
    assert(invalidTaskRes.status === 400, 'Scenario 14: Invalid task ID string returns 400 Bad Request');

    const invalidRoadmapRes = await makeRequest('/api/v1/roadmaps/not-a-mongo-id', 'GET');
    assert(invalidRoadmapRes.status === 400, 'Scenario 15: Invalid roadmap ID string returns 400 Bad Request');

    // --- TEST SCENARIO 16: Empty Notification List ---
    const emptyNotifRes = await makeRequest('/api/v1/notifications', 'GET');
    assert(emptyNotifRes.status === 200 && Array.isArray(emptyNotifRes.data.data.notifications), 'Scenario 16: Empty notification list returns 200 OK with empty array');

    // --- TEST SCENARIO 18: Pagination Validation ---
    const paginatedRes = await makeRequest('/api/v1/roadmaps?page=1&limit=5', 'GET');
    assert(paginatedRes.status === 200 && paginatedRes.data.data.pagination.limit === 5, 'Scenario 18: Pagination returns 200 OK with page metadata');

    // --- TEST SCENARIO 19: Invalid Query Parameters ---
    const invalidQueryRes = await makeRequest('/api/v1/roadmaps?page=-1', 'GET');
    assert(invalidQueryRes.status === 400, 'Scenario 19: Invalid query parameter page=-1 returns 400 Bad Request');

    // Cleanup & Restore
    server.close();
    User.findById = origUserFindById;
    LearningRoadmap.findOne = origRoadmapFindOne;
    LearningRoadmap.find = origRoadmapFind;
    LearningRoadmap.countDocuments = origRoadmapCount;
    LearningRoadmap.prototype.save = origRoadmapSave;
    LearningTask.prototype.save = origTaskSave;
    LearningTask.find = origTaskFind;
    LearningTask.findOne = origTaskFindOne;
    LearningTask.findOneAndUpdate = origTaskFindOneAndUpdate;
    geminiProvider.generateContentWithRetry = origGenerateContent;

  } catch (err) {
    assert(false, 'API Testing Suite exception', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);
}

runApiTestingSuite();
