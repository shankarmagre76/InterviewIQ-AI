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
import Profile from '../profile/profile.model.js';
import Resume from '../resume/resume.model.js';
import ResumeAnalysis from '../resume/resumeAnalysis.model.js';
import InterviewResult from '../interview/interviewResult.model.js';
import Application from '../application/application.model.js';

import geminiProvider from '../services/ai.service.js';
import roadmapRepository from './learningRoadmap.repository.js';

console.log('=================================================================');
console.log('  INTERVIEWIQ AI - PHASE 9.11 COMPLETE API TESTING SUITE');
console.log('=================================================================\n');

async function runPhase911TestSuite() {
  let passedCount = 0;
  let failedCount = 0;
  const testResults = [];

  const assert = (condition, scenarioNum, title, detail = '') => {
    if (condition) {
      passedCount++;
      console.log(`[PASS] Scenario ${scenarioNum}: ${title}`);
      testResults.push({ scenario: scenarioNum, title, status: 'PASSED', detail });
    } else {
      failedCount++;
      console.error(`[FAIL] Scenario ${scenarioNum}: ${title} - ${detail}`);
      testResults.push({ scenario: scenarioNum, title, status: 'FAILED', detail });
    }
  };

  try {
    const userAId = new mongoose.Types.ObjectId().toString();
    const userBId = new mongoose.Types.ObjectId().toString();
    const tokenA = `Bearer ${generateAccessToken({ id: userAId })}`;
    const tokenB = `Bearer ${generateAccessToken({ id: userBId })}`;

    // Stub User model findById
    const origUserFindById = User.findById;
    User.findById = async (id) => {
      const idStr = String(id);
      if (idStr === userAId || idStr === userBId) {
        return { _id: idStr, email: `user_${idStr.slice(-4)}@example.com`, isActive: true };
      }
      return null;
    };

    // Stub Context Domain Models for AI Context Gathering
    const origProfileFindOne = Profile.findOne;
    const origResumeFindOne = Resume.findOne;
    const origResumeAnalysisFindOne = ResumeAnalysis.findOne;
    const origInterviewResultFind = InterviewResult.find;
    const origApplicationFind = Application.find;

    Profile.findOne = (query) => ({
      lean: async () => ({
        user: query.user,
        headline: 'Senior Full-Stack Engineer',
        skills: [{ name: 'Node.js' }, { name: 'React' }, { name: 'MongoDB' }],
        experienceLevel: 'Senior',
      }),
    });

    Resume.findOne = (query) => ({
      lean: async () => {
        if (String(query.user) === userBId) return null;
        return { user: query.user, originalName: 'john_doe_resume.pdf', isActive: true };
      },
    });

    ResumeAnalysis.findOne = () => ({
      sort: () => ({
        lean: async () => ({
          atsScore: 85,
          missingSkills: ['TypeScript', 'GraphQL'],
          recommendedSkills: ['Docker', 'AWS'],
          weaknesses: ['Lack of Kubernetes experience'],
        }),
      }),
    });

    InterviewResult.find = (query) => ({
      sort: () => ({
        limit: () => ({
          lean: async () => {
            if (String(query.user) === userBId) return [];
            return [
              {
                overallScore: 82,
                technicalScore: 85,
                communicationScore: 80,
                weaknesses: ['System Design Scalability'],
              },
            ];
          },
        }),
      }),
    });

    Application.find = () => ({
      populate: () => ({
        populate: () => ({
          sort: () => ({
            limit: () => ({
              lean: async () => [],
            }),
          }),
        }),
      }),
    });

    // Setup Express Server Instance
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
      const data = await res.json().catch(() => ({}));
      return { status: res.status, data };
    };

    // Mock In-Memory DB Stores
    let mockRoadmaps = [];
    let mockTasks = [];
    let mockNotifications = [];

    // Save Original Mongoose & Service Methods
    const origRoadmapFindOne = LearningRoadmap.findOne;
    const origRoadmapFind = LearningRoadmap.find;
    const origRoadmapCount = LearningRoadmap.countDocuments;
    const origRoadmapSave = LearningRoadmap.prototype.save;
    const origRoadmapCreate = LearningRoadmap.create;
    const origRoadmapFindOneAndUpdate = LearningRoadmap.findOneAndUpdate;
    const origRoadmapFindOneAndDelete = LearningRoadmap.findOneAndDelete;

    const origTaskSave = LearningTask.prototype.save;
    const origTaskCreate = LearningTask.create;
    const origTaskInsertMany = LearningTask.insertMany;
    const origTaskFind = LearningTask.find;
    const origTaskFindOne = LearningTask.findOne;
    const origTaskFindOneAndUpdate = LearningTask.findOneAndUpdate;
    const origTaskDeleteMany = LearningTask.deleteMany;

    const origNotificationFind = Notification.find;
    const origNotificationCount = Notification.countDocuments;
    const origNotificationFindOne = Notification.findOne;
    const origNotificationSave = Notification.prototype.save;
    const origNotificationUpdateMany = Notification.updateMany;
    const origNotificationFindOneAndUpdate = Notification.findOneAndUpdate;
    const origNotificationFindOneAndDelete = Notification.findOneAndDelete;
    const origGenerateContent = geminiProvider.generateContentWithRetry;

    // Helper for matching roadmap query safely against raw object or Mongoose doc
    const findRoadmapMatch = (query) => {
      return mockRoadmaps.find((r) => {
        const item = r._doc ? r._doc : r;
        if (query._id && String(item._id) !== String(query._id)) return false;
        if (query.user && String(item.user) !== String(query.user)) return false;
        if (query.isActive !== undefined && item.isActive !== query.isActive) return false;
        if (query.status && item.status !== query.status) return false;
        return true;
      }) || null;
    };

    // Model Implementations for Mongoose Stubs
    LearningRoadmap.findOne = (query) => {
      const match = findRoadmapMatch(query);
      const queryObj = {
        then: (resolve) => resolve(match),
        sort: () => ({
          then: (resolve) => resolve(match),
          lean: async () => match,
        }),
        lean: async () => match,
      };
      return queryObj;
    };

    LearningRoadmap.find = (query = {}) => {
      let filtered = [...mockRoadmaps];
      if (query.user) filtered = filtered.filter((r) => String(r.user || r._doc?.user) === String(query.user));
      if (query.status) filtered = filtered.filter((r) => (r.status || r._doc?.status) === query.status);

      return {
        sort: () => ({
          skip: (skipVal = 0) => ({
            limit: (limitVal = 10) => ({
              lean: async () => filtered.slice(skipVal, skipVal + limitVal),
            }),
          }),
        }),
      };
    };

    LearningRoadmap.countDocuments = async (query = {}) => {
      let filtered = [...mockRoadmaps];
      if (query.user) filtered = filtered.filter((r) => String(r.user || r._doc?.user) === String(query.user));
      if (query.status) filtered = filtered.filter((r) => (r.status || r._doc?.status) === query.status);
      return filtered.length;
    };

    LearningRoadmap.create = async (docData) => {
      const item = Array.isArray(docData) ? docData[0] : docData;
      if (!item._id) item._id = new mongoose.Types.ObjectId().toString();
      mockRoadmaps.push(item);
      return Array.isArray(docData) ? [item] : item;
    };

    LearningRoadmap.findOneAndUpdate = async (query, update) => {
      const roadmap = findRoadmapMatch(query);
      if (!roadmap) return null;
      Object.assign(roadmap, update);
      if (roadmap._doc) Object.assign(roadmap._doc, update);
      return roadmap;
    };

    LearningRoadmap.findOneAndDelete = async (query) => {
      const idx = mockRoadmaps.findIndex((r) => {
        const item = r._doc ? r._doc : r;
        if (query._id && String(item._id) !== String(query._id)) return false;
        if (query.user && String(item.user) !== String(query.user)) return false;
        return true;
      });
      if (idx !== -1) {
        return mockRoadmaps.splice(idx, 1)[0];
      }
      return null;
    };

    LearningRoadmap.prototype.save = async function () {
      if (!this._id) this._id = new mongoose.Types.ObjectId().toString();
      const existingIdx = mockRoadmaps.findIndex((r) => String(r._id) === String(this._id));
      if (existingIdx !== -1) {
        mockRoadmaps[existingIdx] = this;
      } else {
        mockRoadmaps.push(this);
      }
      return this;
    };

    LearningTask.insertMany = async (arr) => {
      arr.forEach((t) => {
        if (!t._id) t._id = new mongoose.Types.ObjectId().toString();
        mockTasks.push(t);
      });
      return arr;
    };

    LearningTask.prototype.save = async function () {
      if (!this._id) this._id = new mongoose.Types.ObjectId().toString();
      const existingIdx = mockTasks.findIndex((t) => String(t._id) === String(this._id));
      if (existingIdx !== -1) {
        mockTasks[existingIdx] = this;
      } else {
        mockTasks.push(this);
      }
      return this;
    };

    LearningTask.find = (query) => ({
      sort: () => ({
        lean: async () => mockTasks.filter((t) => String(t.roadmap || t._doc?.roadmap) === String(query.roadmap)),
      }),
    });

    LearningTask.findOne = async (query) => {
      return mockTasks.find((t) => {
        const item = t._doc ? t._doc : t;
        if (query._id && String(item._id) !== String(query._id)) return false;
        if (query.user && String(item.user) !== String(query.user)) return false;
        return true;
      }) || null;
    };

    LearningTask.findOneAndUpdate = async (query, update) => {
      const task = mockTasks.find((t) => {
        const item = t._doc ? t._doc : t;
        return String(item._id) === String(query._id) && String(item.user) === String(query.user);
      });
      if (!task) return null;
      Object.assign(task, update);
      if (task._doc) Object.assign(task._doc, update);
      return task;
    };

    LearningTask.deleteMany = async (query) => {
      const initialLen = mockTasks.length;
      mockTasks = mockTasks.filter((t) => {
        const item = t._doc ? t._doc : t;
        return !(String(item.roadmap) === String(query.roadmap) && String(item.user) === String(query.user));
      });
      return { deletedCount: initialLen - mockTasks.length };
    };

    Notification.find = (query = {}) => {
      let filtered = [...mockNotifications];
      if (query.user) filtered = filtered.filter((n) => String(n.user || n._doc?.user) === String(query.user));
      if (query.isRead !== undefined) filtered = filtered.filter((n) => (n.isRead !== undefined ? n.isRead : n._doc?.isRead) === query.isRead);

      return {
        sort: () => ({
          skip: (skipVal = 0) => ({
            limit: (limitVal = 10) => ({
              lean: async () => filtered.slice(skipVal, skipVal + limitVal),
            }),
          }),
        }),
      };
    };

    Notification.countDocuments = async (query = {}) => {
      let filtered = [...mockNotifications];
      if (query.user) filtered = filtered.filter((n) => String(n.user || n._doc?.user) === String(query.user));
      if (query.isRead !== undefined) filtered = filtered.filter((n) => (n.isRead !== undefined ? n.isRead : n._doc?.isRead) === query.isRead);
      return filtered.length;
    };

    Notification.findOne = async (query) => {
      return mockNotifications.find((n) => {
        const item = n._doc ? n._doc : n;
        if (query._id && String(item._id) !== String(query._id)) return false;
        if (query.user && String(item.user) !== String(query.user)) return false;
        return true;
      }) || null;
    };

    Notification.prototype.save = async function () {
      if (!this._id) this._id = new mongoose.Types.ObjectId().toString();
      const idx = mockNotifications.findIndex((n) => String(n._id) === String(this._id));
      if (idx !== -1) {
        mockNotifications[idx] = this;
      } else {
        mockNotifications.push(this);
      }
      return this;
    };

    Notification.findOneAndUpdate = async (query, update) => {
      const notif = mockNotifications.find((n) => {
        const item = n._doc ? n._doc : n;
        if (query._id && String(item._id) !== String(query._id)) return false;
        if (query.user && String(item.user) !== String(query.user)) return false;
        return true;
      });
      if (!notif) return null;
      Object.assign(notif, update);
      if (notif._doc) Object.assign(notif._doc, update);
      return notif;
    };

    Notification.updateMany = async (query, update) => {
      let count = 0;
      mockNotifications.forEach((n) => {
        const item = n._doc ? n._doc : n;
        if (String(item.user) === String(query.user) && (query.isRead === undefined || item.isRead === query.isRead)) {
          Object.assign(n, update);
          if (n._doc) Object.assign(n._doc, update);
          count++;
        }
      });
      return { modifiedCount: count };
    };

    Notification.findOneAndDelete = async (query) => {
      const idx = mockNotifications.findIndex((n) => {
        const item = n._doc ? n._doc : n;
        return String(item._id) === String(query._id) && String(item.user) === String(query.user);
      });
      if (idx !== -1) {
        return mockNotifications.splice(idx, 1)[0];
      }
      return null;
    };

    // Default Mock AI Payload
    const mockAiValidJson = JSON.stringify({
      title: 'Full-Stack Developer Roadmap',
      description: 'Master Node.js, Express, and React.',
      skillGaps: ['TypeScript', 'Docker'],
      phases: [
        {
          title: 'Phase 1: Fundamentals',
          description: 'Learn strict typing and containerization.',
          skills: ['TypeScript', 'Docker'],
          priority: 'HIGH',
          estimatedDays: 7,
          order: 1,
          tasks: [
            {
              title: 'Study TypeScript',
              description: 'Read interfaces and generics.',
              type: 'LEARNING',
              skills: ['TypeScript'],
              priority: 'HIGH',
              estimatedMinutes: 45,
              order: 1,
              resources: [{ title: 'TS Docs', url: 'https://typescriptlang.org', type: 'DOCUMENTATION' }],
            },
            {
              title: 'Dockerizing Express App',
              description: 'Write Dockerfile.',
              type: 'PRACTICE',
              skills: ['Docker'],
              priority: 'MEDIUM',
              estimatedMinutes: 60,
              order: 2,
              resources: [],
            },
          ],
        },
      ],
    });

    geminiProvider.generateContentWithRetry = async () => mockAiValidJson;

    // =========================================================================
    // EXECUTE SCENARIO TESTS
    // =========================================================================

    // SCENARIO 1: Valid Authenticated User
    const res1 = await makeRequest('/api/v1/roadmaps/active', 'GET', null, tokenA);
    assert(res1.status === 200 && res1.data.success === true, 1, 'Valid authenticated user', `Status: ${res1.status}`);

    // SCENARIO 2: Missing JWT
    const res2 = await makeRequest('/api/v1/roadmaps/active', 'GET', null, null);
    assert(res2.status === 401 && res2.data.success === false, 2, 'Missing JWT returns 401 Unauthorized', `Status: ${res2.status}`);

    // SCENARIO 3: Invalid JWT
    const res3 = await makeRequest('/api/v1/roadmaps/active', 'GET', null, 'Bearer invalid.jwt.token');
    assert(res3.status === 401 && res3.data.success === false, 3, 'Invalid JWT returns 401 Unauthorized', `Status: ${res3.status}`);

    // SCENARIO 6: Generate Roadmap with Complete Profile
    const res6 = await makeRequest('/api/v1/roadmaps/generate', 'POST', { targetRole: 'Senior Engineer' }, tokenA);
    assert(
      res6.status === 201 && res6.data.success === true && res6.data.data.roadmap.version === 1,
      6,
      'Generate roadmap with complete profile creates v1 roadmap',
      `Roadmap ID: ${res6.data.data?.roadmap?._id}`
    );

    const userARoadmapId = res6.data.data?.roadmap?._id;
    const userATaskId = res6.data.data?.tasks?.[0]?._id;

    // SCENARIO 4: User Accessing Another User's Roadmap
    const res4 = await makeRequest(`/api/v1/roadmaps/${userARoadmapId}`, 'GET', null, tokenB);
    assert(res4.status === 404, 4, "User accessing another user's roadmap returns 404 Not Found", `Status: ${res4.status}`);

    // SCENARIO 5: User Accessing Another User's Task
    const res5 = await makeRequest(`/api/v1/roadmaps/tasks/${userATaskId}/complete`, 'PATCH', null, tokenB);
    assert(res5.status === 404, 5, "User accessing another user's task returns 404 Not Found", `Status: ${res5.status}`);

    // SCENARIO 7: Generate Roadmap without Resume
    const res7 = await makeRequest('/api/v1/roadmaps/generate', 'POST', { targetRole: 'Backend Developer' }, tokenB);
    assert(res7.status === 201 && res7.data.success === true, 7, 'Generate roadmap without resume handles candidate profile', `Status: ${res7.status}`);

    // SCENARIO 8: Generate Roadmap without Interview History
    const res8 = await makeRequest('/api/v1/roadmaps/generate', 'POST', { targetRole: 'Frontend Developer', forceRegenerate: true }, tokenB);
    assert(res8.status === 201 && res8.data.success === true, 8, 'Generate roadmap without interview history succeeds', `Status: ${res8.status}`);

    // SCENARIO 11: Duplicate Active Roadmap & Force Regeneration
    const res11 = await makeRequest('/api/v1/roadmaps/generate', 'POST', { forceRegenerate: true }, tokenA);
    assert(
      res11.status === 201 && res11.data.data.roadmap.version === 2,
      11,
      'Regeneration archives existing active roadmap and creates v2',
      `New Version: ${res11.data.data?.roadmap?.version}`
    );

    const activeRoadmapV2Id = res11.data.data.roadmap._id;
    const activeTaskId = res11.data.data.tasks[0]._id;

    // SCENARIO 12: Complete Task Twice (Idempotency)
    const res12a = await makeRequest(`/api/v1/roadmaps/tasks/${activeTaskId}/complete`, 'PATCH', null, tokenA);
    const res12b = await makeRequest(`/api/v1/roadmaps/tasks/${activeTaskId}/complete`, 'PATCH', null, tokenA);
    assert(
      res12a.status === 200 && res12b.status === 200 && res12b.data.data.task.status === 'COMPLETED',
      12,
      'Complete task twice executes idempotently with 200 OK',
      `Task status: ${res12b.data.data?.task?.status}`
    );

    // SCENARIO 13: Reopen Completed Task
    const res13 = await makeRequest(`/api/v1/roadmaps/tasks/${activeTaskId}/reopen`, 'PATCH', null, tokenA);
    assert(
      res13.status === 200 && res13.data.data.task.status === 'IN_PROGRESS',
      13,
      'Reopen completed task sets status back to IN_PROGRESS and adjusts progress',
      `New Task Status: ${res13.data.data?.task?.status}`
    );

    // SCENARIO 9: Gemini API Failure
    const savedGeminiMock = geminiProvider.generateContentWithRetry;
    geminiProvider.generateContentWithRetry = async () => {
      throw new Error('Gemini API quota exceeded or connection timed out');
    };
    const res9 = await makeRequest('/api/v1/roadmaps/generate', 'POST', { targetRole: 'AI Engineer', forceRegenerate: true }, tokenA);
    assert(res9.status === 502 || res9.status === 500, 9, 'Gemini API failure is caught and formatted properly', `Status: ${res9.status}`);

    // SCENARIO 10: Invalid AI Response
    geminiProvider.generateContentWithRetry = async () => 'INVALID_NON_JSON_AI_RESPONSE';
    const res10 = await makeRequest('/api/v1/roadmaps/generate', 'POST', { targetRole: 'AI Engineer', forceRegenerate: true }, tokenA);
    assert(res10.status === 502 || res10.status === 500, 10, 'Invalid AI response triggers fallback/error response', `Status: ${res10.status}`);

    // Restore Gemini mock
    geminiProvider.generateContentWithRetry = savedGeminiMock;

    // SCENARIO 14: Invalid Task ID
    const res14 = await makeRequest('/api/v1/roadmaps/tasks/invalid-mongo-id/complete', 'PATCH', null, tokenA);
    assert(res14.status === 400, 14, 'Invalid task ID string returns 400 Bad Request', `Status: ${res14.status}`);

    // SCENARIO 15: Invalid Roadmap ID
    const res15 = await makeRequest('/api/v1/roadmaps/invalid-mongo-id', 'GET', null, tokenA);
    assert(res15.status === 400, 15, 'Invalid roadmap ID string returns 400 Bad Request', `Status: ${res15.status}`);

    // SCENARIO 16: Empty Notification List
    mockNotifications = []; // Ensure empty notifications array
    const res16 = await makeRequest('/api/v1/notifications', 'GET', null, tokenA);
    assert(
      res16.status === 200 && Array.isArray(res16.data.data.notifications) && res16.data.data.notifications.length === 0,
      16,
      'Empty notification list returns 200 OK with empty array',
      `Count: ${res16.data.data?.notifications?.length}`
    );

    // Seed sample notification for Scenario 17
    const notifSample = new Notification({
      _id: new mongoose.Types.ObjectId().toString(),
      user: userAId,
      title: 'Roadmap Ready',
      message: 'Your roadmap v2 has been generated.',
      type: 'ROADMAP_GENERATED',
      isRead: true,
    });
    mockNotifications.push(notifSample);

    // SCENARIO 17: Mark Already-Read Notification
    const res17 = await makeRequest(`/api/v1/notifications/${notifSample._id}/read`, 'PATCH', null, tokenA);
    assert(res17.status === 200 && res17.data.data.isRead === true, 17, 'Mark already-read notification returns 200 OK idempotently', `Status: ${res17.status}`);

    // SCENARIO 18: Pagination
    const res18 = await makeRequest('/api/v1/roadmaps?page=1&limit=5', 'GET', null, tokenA);
    assert(
      res18.status === 200 && res18.data.data.pagination.limit === 5,
      18,
      'Pagination params return 200 OK with formatted metadata',
      `Page Limit: ${res18.data.data?.pagination?.limit}`
    );

    // SCENARIO 19: Invalid Query Parameters
    const res19 = await makeRequest('/api/v1/roadmaps?page=-1', 'GET', null, tokenA);
    assert(res19.status === 400, 19, 'Invalid query parameters (page=-1) return 400 Bad Request', `Status: ${res19.status}`);

    // SCENARIO 20: Database Failure Handling
    const origRoadmapFindByIdRepo = roadmapRepository.getRoadmapById;
    roadmapRepository.getRoadmapById = async () => {
      throw new Error('MongoServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster');
    };
    const res20 = await makeRequest(`/api/v1/roadmaps/${activeRoadmapV2Id}`, 'GET', null, tokenA);
    assert(res20.status === 500, 20, 'Database failure returns 500 Internal Server Error', `Status: ${res20.status}`);

    roadmapRepository.getRoadmapById = origRoadmapFindByIdRepo;

    // Cleanup & Teardown
    server.close();
    User.findById = origUserFindById;
    Profile.findOne = origProfileFindOne;
    Resume.findOne = origResumeFindOne;
    ResumeAnalysis.findOne = origResumeAnalysisFindOne;
    InterviewResult.find = origInterviewResultFind;
    Application.find = origApplicationFind;

    LearningRoadmap.findOne = origRoadmapFindOne;
    LearningRoadmap.find = origRoadmapFind;
    LearningRoadmap.countDocuments = origRoadmapCount;
    LearningRoadmap.prototype.save = origRoadmapSave;
    LearningRoadmap.create = origRoadmapCreate;
    LearningRoadmap.findOneAndUpdate = origRoadmapFindOneAndUpdate;
    LearningRoadmap.findOneAndDelete = origRoadmapFindOneAndDelete;

    LearningTask.prototype.save = origTaskSave;
    LearningTask.create = origTaskCreate;
    LearningTask.insertMany = origTaskInsertMany;
    LearningTask.find = origTaskFind;
    LearningTask.findOne = origTaskFindOne;
    LearningTask.findOneAndUpdate = origTaskFindOneAndUpdate;
    LearningTask.deleteMany = origTaskDeleteMany;

    Notification.find = origNotificationFind;
    Notification.countDocuments = origNotificationCount;
    Notification.findOne = origNotificationFindOne;
    Notification.prototype.save = origNotificationSave;
    Notification.updateMany = origNotificationUpdateMany;
    Notification.findOneAndUpdate = origNotificationFindOneAndUpdate;
    Notification.findOneAndDelete = origNotificationFindOneAndDelete;
    geminiProvider.generateContentWithRetry = origGenerateContent;

  } catch (err) {
    assert(false, 0, 'Testing Suite unexpected execution exception', err.stack);
  }

  console.log('\n=================================================================');
  console.log(` SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} Scenarios`);
  console.log('=================================================================\n');

  return { passedCount, failedCount, testResults };
}

runPhase911TestSuite();
