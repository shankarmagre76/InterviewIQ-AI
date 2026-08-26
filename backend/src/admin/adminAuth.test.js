import express from 'express';
import mongoose from 'mongoose';
import routes from '../routes/index.js';
import errorHandler from '../middleware/error.middleware.js';
import { generateAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';

console.log('=================================================================');
console.log('  INTERVIEWIQ AI - PHASE 10.1 ADMIN AUTHORIZATION TEST SUITE');
console.log('=================================================================\n');

async function runAdminAuthTestSuite() {
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
    const recruiterId = new mongoose.Types.ObjectId().toString();

    const adminToken = `Bearer ${generateAccessToken({ id: adminId })}`;
    const studentToken = `Bearer ${generateAccessToken({ id: studentId })}`;
    const recruiterToken = `Bearer ${generateAccessToken({ id: recruiterId })}`;

    // Stub User model findById
    const origUserFindById = User.findById;
    User.findById = async (id) => {
      const idStr = String(id);
      if (idStr === adminId) {
        return { _id: idStr, email: 'admin@interviewiq.ai', role: 'Admin', isActive: true };
      }
      if (idStr === studentId) {
        return { _id: idStr, email: 'student@example.com', role: 'Student', isActive: true };
      }
      if (idStr === recruiterId) {
        return { _id: idStr, email: 'recruiter@techcorp.com', role: 'Recruiter', isActive: true };
      }
      return null;
    };

    // Setup Express App
    const app = express();
    app.use(express.json());
    app.use(routes);
    app.use(errorHandler);

    const server = app.listen(0);
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    const makeRequest = async (path, method = 'GET', body = null, token = null) => {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = token;

      const opts = { method, headers };
      if (body) opts.body = JSON.stringify(body);

      const res = await fetch(`${baseUrl}${path}`, opts);
      const data = await res.json().catch(() => ({}));
      return { status: res.status, data };
    };

    // --- TEST CASE 1: ADMIN → Allowed (200 OK) ---
    const adminRes = await makeRequest('/api/v1/admin/health', 'GET', null, adminToken);
    assert(
      adminRes.status === 200 && adminRes.data.success === true && adminRes.data.data.adminUser.role === 'Admin',
      'Test Case 1: ADMIN user access to /api/v1/admin/* is allowed with 200 OK',
      `Status: ${adminRes.status}`
    );

    // --- TEST CASE 2: USER (Student/Recruiter) → Forbidden (403 Forbidden) ---
    const studentRes = await makeRequest('/api/v1/admin/health', 'GET', null, studentToken);
    assert(
      studentRes.status === 403 && studentRes.data.success === false,
      'Test Case 2a: Student normal user receive HTTP 403 Forbidden',
      `Status: ${studentRes.status}`
    );

    const recruiterRes = await makeRequest('/api/v1/admin/health', 'GET', null, recruiterToken);
    assert(
      recruiterRes.status === 403 && recruiterRes.data.success === false,
      'Test Case 2b: Recruiter user receive HTTP 403 Forbidden',
      `Status: ${recruiterRes.status}`
    );

    // --- TEST CASE 3: No JWT → Unauthorized (401 Unauthorized) ---
    const noJwtRes = await makeRequest('/api/v1/admin/health', 'GET', null, null);
    assert(
      noJwtRes.status === 401 && noJwtRes.data.success === false,
      'Test Case 3: Request without JWT returns HTTP 401 Unauthorized',
      `Status: ${noJwtRes.status}`
    );

    // --- TEST CASE 4: Invalid JWT → Unauthorized (401 Unauthorized) ---
    const invalidJwtRes = await makeRequest('/api/v1/admin/health', 'GET', null, 'Bearer invalid.token.str');
    assert(
      invalidJwtRes.status === 401 && invalidJwtRes.data.success === false,
      'Test Case 4: Request with invalid JWT returns HTTP 401 Unauthorized',
      `Status: ${invalidJwtRes.status}`
    );

    // --- TEST CASE 5: Request Body / Query Role Tampering → Strictly Forbidden (403 Forbidden) ---
    const tamperRes = await makeRequest(
      '/api/v1/admin/health?role=Admin',
      'POST',
      { role: 'Admin', isAdmin: true },
      studentToken
    );
    assert(
      tamperRes.status === 403 && tamperRes.data.success === false,
      'Test Case 5: Client role tampering in body/query is ignored and strictly rejected with 403 Forbidden',
      `Status: ${tamperRes.status}`
    );

    // Cleanup & Teardown
    server.close();
    User.findById = origUserFindById;

  } catch (err) {
    assert(false, 'Unexpected execution exception in Admin Auth Suite', err.stack);
  }

  console.log('\n=================================================================');
  console.log(` SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} Tests`);
  console.log('=================================================================\n');

  return { passedCount, failedCount };
}

runAdminAuthTestSuite();
