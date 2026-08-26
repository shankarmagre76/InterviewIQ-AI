import express from 'express';
import mongoose from 'mongoose';
import routes from '../routes/index.js';
import errorHandler from '../middleware/error.middleware.js';
import { generateAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import Notification from '../notification/notification.model.js';
import adminNotificationService from './adminNotification.service.js';

console.log('=================================================================');
console.log('  INTERVIEWIQ AI - PHASE 10.9 ADMIN NOTIFICATIONS TEST SUITE');
console.log('=================================================================\n');

async function runAdminNotificationTestSuite() {
  let passedCount = 0;
  let failedCount = 0;

  const assert = (condition, testName, detail = '') => {
    if (condition) {
      passedCount++;
      console.log(`[PASS] ${testName}`);
    } else {
      failedCount++;
      console.error(`[FAIL] ${testName} - ${detail}`);
    }
  };

  try {
    const adminId = new mongoose.Types.ObjectId().toString();
    const student1Id = new mongoose.Types.ObjectId().toString();
    const student2Id = new mongoose.Types.ObjectId().toString();
    const recruiterId = new mongoose.Types.ObjectId().toString();

    const adminToken = `Bearer ${generateAccessToken({ id: adminId })}`;
    const studentToken = `Bearer ${generateAccessToken({ id: student1Id })}`;

    // Stub User model
    const origUserFindById = User.findById;
    const origUserFind = User.find;

    User.findById = async (id) => {
      const idStr = String(id);
      if (idStr === adminId) {
        return { _id: idStr, email: 'admin@interviewiq.ai', role: 'Admin', isActive: true };
      }
      if (idStr === student1Id) {
        return { _id: idStr, email: 'student1@example.com', role: 'Student', isActive: true };
      }
      return null;
    };

    const mockUsersList = [
      { _id: adminId, email: 'admin@interviewiq.ai', role: 'Admin', isActive: true },
      { _id: student1Id, email: 'student1@example.com', role: 'Student', isActive: true },
      { _id: student2Id, email: 'student2@example.com', role: 'Student', isActive: true },
      { _id: recruiterId, email: 'recruiter@techcorp.com', role: 'Recruiter', isActive: true },
    ];

    User.find = (filter = {}) => {
      let filtered = [...mockUsersList];

      if (filter.role) {
        filtered = filtered.filter((u) => u.role === filter.role);
      }
      if (filter.isActive !== undefined) {
        filtered = filtered.filter((u) => u.isActive === filter.isActive);
      }
      if (filter._id && filter._id.$in) {
        const idStrs = filter._id.$in.map(String);
        filtered = filtered.filter((u) => idStrs.includes(String(u._id)));
      }

      return {
        select: () => ({
          lean: async () => filtered,
        }),
      };
    };

    // In-memory Mock Notifications Store
    const mockNotifications = [];

    // Stub Notification model methods
    const origNotifInsertMany = Notification.insertMany;
    const origNotifFindOne = Notification.findOne;
    const origNotifFindById = Notification.findById;
    const origNotifFindByIdAndDelete = Notification.findByIdAndDelete;
    const origNotifFind = Notification.find;
    const origNotifCountDocuments = Notification.countDocuments;

    Notification.insertMany = async (docs) => {
      const created = docs.map((d) => ({
        ...d,
        _id: new mongoose.Types.ObjectId().toString(),
        createdAt: new Date(),
      }));
      mockNotifications.push(...created);
      return created;
    };

    Notification.findOne = async (query = {}) => {
      if (query.title && query.message) {
        return mockNotifications.find(
          (n) => n.title === query.title && n.message === query.message
        ) || null;
      }
      return null;
    };

    Notification.findById = (id) => {
      const found = mockNotifications.find((n) => String(n._id) === String(id));
      return {
        populate: () => ({
          lean: async () => (found ? { ...found, user: { _id: found.user, firstName: 'Alice', email: 'alice@example.com' } } : null),
        }),
      };
    };

    Notification.findByIdAndDelete = async (id) => {
      const idx = mockNotifications.findIndex((n) => String(n._id) === String(id));
      if (idx !== -1) return mockNotifications.splice(idx, 1)[0];
      return null;
    };

    Notification.find = () => ({
      sort: () => ({
        skip: (skipVal = 0) => ({
          limit: (limitVal = 10) => ({
            populate: () => ({
              lean: async () => mockNotifications.slice(skipVal, skipVal + limitVal),
            }),
          }),
        }),
      }),
    });

    Notification.countDocuments = async () => mockNotifications.length;

    // Setup Express App Instance
    const app = express();
    app.use(express.json());
    app.use(routes);
    app.use(errorHandler);

    const server = app.listen(0);
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    const makeRequest = async (path, method = 'GET', body = null, token = adminToken) => {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = token;

      const opts = { method, headers };
      if (body) opts.body = JSON.stringify(body);

      const res = await fetch(`${baseUrl}${path}`, opts);
      const data = await res.json().catch(() => ({}));
      return { status: res.status, data };
    };

    // =========================================================================
    // EXECUTE ADMIN NOTIFICATION ANNOUNCEMENT TEST SCENARIOS
    // =========================================================================

    // 1. Broadcast Announcement to ALL Users (POST /api/v1/admin/notifications)
    const allBroadcastPayload = {
      title: 'Scheduled System Maintenance',
      message: 'InterviewIQ platform will undergo scheduled maintenance tonight at 11 PM UTC.',
      type: 'SYSTEM',
      priority: 'HIGH',
      audience: 'ALL',
    };
    const allRes = await makeRequest('/api/v1/admin/notifications', 'POST', allBroadcastPayload);
    assert(
      allRes.status === 201 &&
        allRes.data.success === true &&
        allRes.data.data.recipientCount === 4,
      'Test 1: Admin can broadcast system maintenance announcement to ALL active users',
      `Recipients: ${allRes.data.data?.recipientCount}`
    );

    // 2. Broadcast Announcement by ROLE (Audience: "ROLE")
    const roleBroadcastPayload = {
      title: 'New Candidate Feature Release',
      message: 'Check out the new AI Resume Analysis features now live in your candidate dashboard!',
      type: 'SYSTEM',
      priority: 'MEDIUM',
      audience: 'ROLE',
      targetRole: 'Student',
    };
    const roleRes = await makeRequest('/api/v1/admin/notifications', 'POST', roleBroadcastPayload);
    assert(
      roleRes.status === 201 && roleRes.data.data.recipientCount === 2,
      'Test 2: Admin can broadcast targeted announcement by ROLE (Student)',
      `Recipients: ${roleRes.data.data?.recipientCount}`
    );

    // 3. Broadcast Announcement to Specific USERS (Audience: "USERS")
    const userBroadcastPayload = {
      title: 'Direct Admin Notification',
      message: 'Important update regarding your account status.',
      type: 'SYSTEM',
      priority: 'URGENT',
      audience: 'USERS',
      userIds: [student1Id],
    };
    const userRes = await makeRequest('/api/v1/admin/notifications', 'POST', userBroadcastPayload);
    assert(
      userRes.status === 201 && userRes.data.data.recipientCount === 1,
      'Test 3: Admin can broadcast targeted notification to specific user IDs',
      `Recipients: ${userRes.data.data?.recipientCount}`
    );

    // 4. Anti-Duplicate Broadcast Check (Identical title & message sent within 5 mins)
    const duplicateRes = await makeRequest('/api/v1/admin/notifications', 'POST', allBroadcastPayload);
    assert(
      duplicateRes.status === 400 && duplicateRes.data.message.includes('already sent within the last 5 minutes'),
      'Test 4: Anti-duplicate check rejects duplicate announcement sent within 5 minutes (400 Bad Request)',
      `Message: ${duplicateRes.data.message}`
    );

    // 5. List Sent Notifications (GET /api/v1/admin/notifications)
    const listRes = await makeRequest('/api/v1/admin/notifications?page=1&limit=10', 'GET');
    assert(
      listRes.status === 200 && listRes.data.success === true && listRes.data.meta.total === 7,
      'Test 5: Admin can list all sent notification records with pagination metadata',
      `Total: ${listRes.data.meta?.total}`
    );

    // 6. View Single Notification Details (GET /api/v1/admin/notifications/:id)
    const firstNotifId = mockNotifications[0]._id;
    const detailRes = await makeRequest(`/api/v1/admin/notifications/${firstNotifId}`, 'GET');
    assert(
      detailRes.status === 200 && detailRes.data.data.title === 'Scheduled System Maintenance',
      'Test 6: Admin can view single notification details with populated user info',
      `Title: ${detailRes.data.data?.title}`
    );

    // 7. Delete Single Notification (DELETE /api/v1/admin/notifications/:id)
    const deleteRes = await makeRequest(`/api/v1/admin/notifications/${firstNotifId}`, 'DELETE');
    assert(
      deleteRes.status === 200 && deleteRes.data.data.deletedNotificationId === firstNotifId,
      'Test 7: Admin can delete a single notification record',
      `Deleted ID: ${deleteRes.data.data?.deletedNotificationId}`
    );

    // 8. Authorization Check: Non-Admin Normal User (Student) -> 403 Forbidden
    const forbiddenRes = await makeRequest('/api/v1/admin/notifications', 'GET', null, studentToken);
    assert(
      forbiddenRes.status === 403,
      'Test 8: Normal non-admin user request returns HTTP 403 Forbidden',
      `Status: ${forbiddenRes.status}`
    );

    // 9. Authentication Check: Missing JWT -> 401 Unauthorized
    const unauthRes = await makeRequest('/api/v1/admin/notifications', 'GET', null, null);
    assert(
      unauthRes.status === 401,
      'Test 9: Unauthenticated request without JWT returns HTTP 401 Unauthorized',
      `Status: ${unauthRes.status}`
    );

    // Cleanup & Teardown
    server.close();
    User.findById = origUserFindById;
    User.find = origUserFind;
    Notification.insertMany = origNotifInsertMany;
    Notification.findOne = origNotifFindOne;
    Notification.findById = origNotifFindById;
    Notification.findByIdAndDelete = origNotifFindByIdAndDelete;
    Notification.find = origNotifFind;
    Notification.countDocuments = origNotifCountDocuments;

  } catch (err) {
    assert(false, 'Unexpected execution exception in Admin Notifications Suite', err.stack);
  }

  console.log('\n=================================================================');
  console.log(` SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} Tests`);
  console.log('=================================================================\n');

  return { passedCount, failedCount };
}

runAdminNotificationTestSuite();
