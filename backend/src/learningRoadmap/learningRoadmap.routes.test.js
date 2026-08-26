import express from 'express';
import mongoose from 'mongoose';
import learningRoadmapRoutes from './learningRoadmap.routes.js';
import notificationRoutes from '../notification/notification.routes.js';
import errorHandler from '../middleware/error.middleware.js';
import { generateAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import notificationRepository from '../notification/notification.repository.js';
import learningRoadmapRepository from './learningRoadmap.repository.js';

console.log('=== INTERVIEWIQ AI - PHASE 9.10 ROUTES & CONTROLLERS TEST SUITE ===\n');

async function runRoutesAndControllersTests() {
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
    const mockUserId = new mongoose.Types.ObjectId().toString();
    const validToken = `Bearer ${generateAccessToken({ id: mockUserId })}`;

    // Stub User.findById for authentication middleware
    const origFindUser = User.findById;
    User.findById = async () => ({
      _id: mockUserId,
      email: 'test@example.com',
      isActive: true,
    });

    // Stub repositories for route responses
    notificationRepository.getUserNotifications = async () => ({
      notifications: [],
      unreadCount: 0,
      pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
    });
    notificationRepository.markAllAsRead = async () => ({ modifiedCount: 2 });

    // 1. Router Initialization Assertions
    assert(typeof learningRoadmapRoutes === 'function', '1. learningRoadmapRoutes exported as Express Router');
    assert(typeof notificationRoutes === 'function', '2. notificationRoutes exported as Express Router');

    // 2. Build Express Test App
    const app = express();
    app.use(express.json());
    app.use('/api/v1/roadmaps', learningRoadmapRoutes);
    app.use('/api/v1/notifications', notificationRoutes);
    app.use(errorHandler);

    // Helper for in-memory HTTP requests
    const server = app.listen(0);
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    const makeRequest = async (path, method = 'GET', body = null, token = validToken) => {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = token;

      const opts = { method, headers };
      if (body) opts.body = JSON.stringify(body);

      const res = await fetch(`${baseUrl}${path}`, opts);
      const data = await res.json();
      return { status: res.status, data };
    };

    // 3. Test Unauthorized Access (Missing JWT)
    const unauthRes = await makeRequest('/api/v1/roadmaps/active', 'GET', null, null);
    assert(unauthRes.status === 401, '3. GET /api/v1/roadmaps/active without JWT returns 401 Unauthorized');

    // 4. Test Route Validation (Invalid Mongo ID)
    const invalidIdRes = await makeRequest('/api/v1/roadmaps/invalid-id-string', 'GET');
    assert(invalidIdRes.status === 400, '4. GET /api/v1/roadmaps/:id with invalid ID string returns 400 Bad Request');
    assert(invalidIdRes.data.message.includes('Invalid Learning Roadmap ID'), '5. Validation returns descriptive error message');

    // 5. Test Authenticated Notifications Endpoints
    const unreadNotifRes = await makeRequest('/api/v1/notifications/unread', 'GET');
    assert(unreadNotifRes.status === 200, '6. GET /api/v1/notifications/unread returns 200 OK');

    const markAllReadRes = await makeRequest('/api/v1/notifications/read-all', 'PATCH');
    assert(markAllReadRes.status === 200, '7. PATCH /api/v1/notifications/read-all returns 200 OK');

    server.close();
    User.findById = origFindUser;

  } catch (err) {
    assert(false, 'Routes and Controllers test exception', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);
}

runRoutesAndControllersTests();
