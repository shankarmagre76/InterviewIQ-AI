import express from 'express';
import mongoose from 'mongoose';
import routes from '../routes/index.js';
import errorHandler from '../middleware/error.middleware.js';
import { generateAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import AdminAuditLog from './adminAuditLog.model.js';
import adminAuditLogRepository from './adminAuditLog.repository.js';
import adminAuditLogService from './adminAuditLog.service.js';

console.log('=================================================================');
console.log('  INTERVIEWIQ AI - PHASE 10.8 ADMIN AUDIT LOGGING TEST SUITE');
console.log('=================================================================\n');

async function runAdminAuditLoggingTestSuite() {
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
    const studentId = new mongoose.Types.ObjectId().toString();

    const adminToken = `Bearer ${generateAccessToken({ id: adminId })}`;
    const studentToken = `Bearer ${generateAccessToken({ id: studentId })}`;

    // Stub User model
    const origUserFindById = User.findById;
    User.findById = async (id) => {
      const idStr = String(id);
      if (idStr === adminId) {
        return { _id: idStr, email: 'admin@interviewiq.ai', role: 'Admin', isActive: true };
      }
      if (idStr === studentId) {
        return { _id: idStr, email: 'student@example.com', role: 'Student', isActive: true };
      }
      return null;
    };

    // In-memory Mock Audit Logs Store
    const log1Id = new mongoose.Types.ObjectId().toString();
    const log2Id = new mongoose.Types.ObjectId().toString();

    const mockLogs = [
      {
        _id: log1Id,
        admin: adminId,
        action: 'DEACTIVATE_USER',
        targetType: 'User',
        targetId: studentId,
        description: 'Admin deactivated student account',
        metadata: { reason: 'Policy violation', secretToken: '[REDACTED_SECRET]' },
        ipAddress: '127.0.0.1',
        createdAt: new Date('2026-02-01T10:00:00Z'),
      },
      {
        _id: log2Id,
        admin: adminId,
        action: 'CREATE_COMPANY',
        targetType: 'Company',
        targetId: new mongoose.Types.ObjectId().toString(),
        description: "Admin created company profile 'Acme Tech'",
        metadata: { companyName: 'Acme Tech' },
        ipAddress: '127.0.0.1',
        createdAt: new Date('2026-02-02T10:00:00Z'),
      },
    ];

    // Stub Repository Methods
    const origGetLogs = adminAuditLogRepository.getLogs;
    const origGetLogById = adminAuditLogRepository.getLogById;
    const origCreateLog = adminAuditLogRepository.createLog;

    adminAuditLogRepository.getLogs = async (filter = {}, options = {}) => {
      let filtered = [...mockLogs];

      if (filter.admin) {
        filtered = filtered.filter((l) => String(l.admin) === String(filter.admin));
      }
      if (filter.action) {
        filtered = filtered.filter((l) => l.action === filter.action);
      }
      if (filter.targetType) {
        filtered = filtered.filter((l) => l.targetType === filter.targetType);
      }

      const page = options.page || 1;
      const limit = options.limit || 10;
      const skip = (page - 1) * limit;

      return {
        logs: filtered.slice(skip, skip + limit),
        total: filtered.length,
        page,
        totalPages: Math.ceil(filtered.length / limit) || 1,
      };
    };

    adminAuditLogRepository.getLogById = async (id) => {
      const found = mockLogs.find((l) => String(l._id) === String(id));
      if (!found) return null;
      return {
        ...found,
        admin: { _id: adminId, firstName: 'System', lastName: 'Admin', email: 'admin@interviewiq.ai' },
      };
    };

    adminAuditLogRepository.createLog = async (data) => {
      const item = { ...data, _id: new mongoose.Types.ObjectId().toString(), createdAt: new Date() };
      mockLogs.push(item);
      return item;
    };

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
    // EXECUTE ADMIN AUDIT LOGGING TEST SCENARIOS
    // =========================================================================

    // 1. List Audit Logs (GET /api/v1/admin/audit-logs)
    const listRes = await makeRequest('/api/v1/admin/audit-logs?page=1&limit=10', 'GET');
    assert(
      listRes.status === 200 && listRes.data.success === true && listRes.data.meta.total === 2,
      'Test 1: Admin can list administrative audit logs with pagination metadata',
      `Total: ${listRes.data.meta?.total}`
    );

    // 2. Filter Audit Logs by Action & TargetType
    const filterRes = await makeRequest('/api/v1/admin/audit-logs?action=DEACTIVATE_USER&targetType=User', 'GET');
    assert(
      filterRes.status === 200 && filterRes.data.data.length === 1 && filterRes.data.data[0].action === 'DEACTIVATE_USER',
      'Test 2: Admin can filter audit logs by action and targetType',
      `Action: ${filterRes.data.data?.[0]?.action}`
    );

    // 3. View Audit Log Record Details (GET /api/v1/admin/audit-logs/:id)
    const detailRes = await makeRequest(`/api/v1/admin/audit-logs/${log1Id}`, 'GET');
    assert(
      detailRes.status === 200 &&
        detailRes.data.data.action === 'DEACTIVATE_USER' &&
        detailRes.data.data.admin.email === 'admin@interviewiq.ai',
      'Test 3: Admin can view single audit log record details',
      `Admin Email: ${detailRes.data.data?.admin?.email}`
    );

    // 4. Secret Redaction & Metadata Sanitization
    const sanitizeResult = adminAuditLogService.sanitizeMetadata({
      user: 'alice',
      password: 'SuperSecretPassword123!',
      jwtToken: 'bearer eyJhbGciOi...',
      apiKey: 'AIzaSySecret...',
    });
    assert(
      sanitizeResult.password === '[REDACTED_SECRET]' &&
        sanitizeResult.jwtToken === '[REDACTED_SECRET]' &&
        sanitizeResult.apiKey === '[REDACTED_SECRET]' &&
        sanitizeResult.user === 'alice',
      'Test 4: Secret sanitization redacts passwords, JWT tokens, and API keys from audit metadata',
      `Password Redacted: ${sanitizeResult.password}`
    );

    // 5. Non-Blocking Resilience: Audit logging failure does not crash service
    adminAuditLogRepository.createLog = async () => {
      throw new Error('Database connection failure during audit log write');
    };
    const logResult = await adminAuditLogService.logAction({
      admin: adminId,
      action: 'DELETE_USER',
      targetType: 'User',
      description: 'Deleting user',
    });
    assert(
      logResult === null,
      'Test 5: Non-blocking audit logger catches database exceptions silently without crashing administrative operation',
      'Non-blocking resilience verified'
    );

    // Restore createLog
    adminAuditLogRepository.createLog = origCreateLog;

    // 6. Authorization Check: Non-Admin Normal User (Student) -> 403 Forbidden
    const forbiddenRes = await makeRequest('/api/v1/admin/audit-logs', 'GET', null, studentToken);
    assert(
      forbiddenRes.status === 403,
      'Test 6: Normal non-admin user request returns HTTP 403 Forbidden',
      `Status: ${forbiddenRes.status}`
    );

    // 7. Authentication Check: Missing JWT -> 401 Unauthorized
    const unauthRes = await makeRequest('/api/v1/admin/audit-logs', 'GET', null, null);
    assert(
      unauthRes.status === 401,
      'Test 7: Unauthenticated request without JWT returns HTTP 401 Unauthorized',
      `Status: ${unauthRes.status}`
    );

    // Cleanup & Teardown
    server.close();
    User.findById = origUserFindById;
    adminAuditLogRepository.getLogs = origGetLogs;
    adminAuditLogRepository.getLogById = origGetLogById;
    adminAuditLogRepository.createLog = origCreateLog;

  } catch (err) {
    assert(false, 'Unexpected execution exception in Admin Audit Logging Suite', err.stack);
  }

  console.log('\n=================================================================');
  console.log(` SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} Tests`);
  console.log('=================================================================\n');

  return { passedCount, failedCount };
}

runAdminAuditLoggingTestSuite();
