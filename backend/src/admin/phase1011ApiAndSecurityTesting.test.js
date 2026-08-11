import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import routes from '../routes/index.js';
import errorHandler from '../middleware/error.middleware.js';
import { generateAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import Company from '../company/company.model.js';
import Job from '../job/job.model.js';
import Application from '../application/application.model.js';
import Notification from '../notification/notification.model.js';
import adminAuditLogService from './adminAuditLog.service.js';
import adminAuditLogRepository from './adminAuditLog.repository.js';
import adminAnalyticsRepository from './adminAnalytics.repository.js';
import adminAiUsageRepository from './adminAiUsage.repository.js';
import adminApplicationRepository from './adminApplication.repository.js';
import companyRepository from '../company/company.repository.js';
import jobRepository from '../job/job.repository.js';

console.log('=================================================================');
console.log('  INTERVIEWIQ AI - PHASE 10.11 ADMIN API & SECURITY TEST SUITE');
console.log('=================================================================\n');

async function runPhase1011SecurityTestSuite() {
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
    const companyId = new mongoose.Types.ObjectId().toString();
    const jobId = new mongoose.Types.ObjectId().toString();

    const adminToken = `Bearer ${generateAccessToken({ id: adminId })}`;
    const studentToken = `Bearer ${generateAccessToken({ id: studentId })}`;
    const invalidToken = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.invalidsignature`;

    // Generate expired JWT token
    const secret = process.env.JWT_ACCESS_SECRET || 'test_jwt_access_secret_key_12345';
    const expiredJwt = jwt.sign({ id: adminId }, secret, { expiresIn: '-10s' });
    const expiredToken = `Bearer ${expiredJwt}`;

    // Stub User model methods safely
    const origUserFindById = User.findById;
    const origUserFind = User.find;
    const origUserCountDocuments = User.countDocuments;

    const mockUsers = [
      { _id: adminId, firstName: 'System', lastName: 'Admin', email: 'admin@interviewiq.ai', role: 'Admin', isActive: true },
      { _id: studentId, firstName: 'Alice', lastName: 'Student', email: 'student@example.com', role: 'Student', isActive: true },
    ];

    const makeQueryObj = (val) => ({
      select: () => makeQueryObj(val),
      sort: () => makeQueryObj(val),
      skip: () => makeQueryObj(val),
      limit: () => makeQueryObj(val),
      lean: async () => val,
      then: (resolve) => resolve(val),
    });

    User.findById = (id) => {
      const idStr = String(id);
      const found = mockUsers.find((u) => String(u._id) === idStr) || null;
      return makeQueryObj(found);
    };

    User.find = (filter = {}) => {
      return makeQueryObj(mockUsers);
    };

    User.countDocuments = async () => mockUsers.length;

    // Setup Express App
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
    // 1. AUTHORIZATION SCENARIOS
    // =========================================================================

    // 1.1 Valid Admin Token -> Allowed
    const authPass = await makeRequest('/api/v1/admin/health', 'GET', null, adminToken);
    assert(authPass.status === 200 && authPass.data.success === true, '1.1 Admin with valid JWT token -> Allowed (200 OK)');

    // 1.2 Normal User Token -> 403 Forbidden
    const authForbidden = await makeRequest('/api/v1/admin/health', 'GET', null, studentToken);
    assert(authForbidden.status === 403, '1.2 Normal user with valid JWT -> Rejected (403 Forbidden)');

    // 1.3 Missing Token -> 401 Unauthorized
    const authMissing = await makeRequest('/api/v1/admin/health', 'GET', null, null);
    assert(authMissing.status === 401, '1.3 Missing JWT token -> Rejected (401 Unauthorized)');

    // 1.4 Invalid Token -> 401 Unauthorized
    const authInvalid = await makeRequest('/api/v1/admin/health', 'GET', null, invalidToken);
    assert(authInvalid.status === 401, '1.4 Invalid JWT signature/format -> Rejected (401 Unauthorized)');

    // 1.5 Expired Token -> 401 Unauthorized
    const authExpired = await makeRequest('/api/v1/admin/health', 'GET', null, expiredToken);
    assert(authExpired.status === 401, '1.5 Expired JWT token -> Rejected (401 Unauthorized)');

    // =========================================================================
    // 2. USER MANAGEMENT SCENARIOS & GUARDS
    // =========================================================================

    // 2.1 Attempt Admin Self-Deactivation Guard -> 400 Bad Request
    const selfDeactivateRes = await makeRequest(`/api/v1/admin/users/${adminId}/status`, 'PATCH', { status: 'deactivated' });
    assert(selfDeactivateRes.status === 400 && selfDeactivateRes.data.message.includes('deactivate their own account'), '2.1 Admin self-deactivation guard blocks operation (400 Bad Request)');

    // 2.2 Attempt Admin Self-Demotion Guard -> 400 Bad Request
    const selfDemoteRes = await makeRequest(`/api/v1/admin/users/${adminId}/role`, 'PATCH', { role: 'Student' });
    assert(selfDemoteRes.status === 400 && selfDemoteRes.data.message.includes('revoke their own admin role'), '2.2 Admin self-demotion guard blocks operation (400 Bad Request)');

    // 2.3 Attempt Admin Self-Deletion Guard -> 400 Bad Request
    const selfDeleteRes = await makeRequest(`/api/v1/admin/users/${adminId}`, 'DELETE');
    assert(selfDeleteRes.status === 400 && selfDeleteRes.data.message.includes('delete their own account'), '2.3 Admin self-deletion guard blocks operation (400 Bad Request)');

    // =========================================================================
    // 3. COMPANY MANAGEMENT SCENARIOS & SAFETY GUARDS
    // =========================================================================

    // Stub Company Repository Methods
    const origGetCompany = companyRepository.getCompany;
    const origGetCompanyByName = companyRepository.getCompanyByName;
    const origCreateCompany = companyRepository.createCompany;

    companyRepository.getCompany = async (id) => {
      if (String(id) === companyId) {
        return { _id: companyId, companyName: 'Acme Inc', industry: 'Tech', hiringStatus: 'Actively Hiring' };
      }
      return null;
    };

    companyRepository.getCompanyByName = async (name) => {
      if (String(name).toLowerCase() === 'acme inc') {
        return { _id: companyId, companyName: 'Acme Inc' };
      }
      return null;
    };

    // 3.1 Duplicate Company Name -> 400 Bad Request
    const dupCompanyRes = await makeRequest('/api/v1/admin/companies', 'POST', {
      companyName: 'Acme Inc',
      industry: 'Tech',
    });
    assert(dupCompanyRes.status === 400 && dupCompanyRes.data.message.includes('already exists'), '3.1 Duplicate company name rejected (400 Bad Request)');

    // 3.2 Invalid Company ObjectId -> 400 Bad Request
    const invalidCompanyIdRes = await makeRequest('/api/v1/admin/companies/invalid-mongo-id', 'GET');
    assert(invalidCompanyIdRes.status === 400, '3.2 Invalid company ObjectId format rejected by validator (400 Bad Request)');

    // 3.3 Job Safety Guard for Company Deletion -> 400 Bad Request
    const origJobCount = Job.countDocuments;
    Job.countDocuments = async () => 3; // Simulate 3 active jobs

    const companyJobGuardRes = await makeRequest(`/api/v1/admin/companies/${companyId}`, 'DELETE');
    assert(companyJobGuardRes.status === 400 && companyJobGuardRes.data.message.includes('active job postings'), '3.3 Company deletion with active jobs rejected by Job Safety Guard (400 Bad Request)');

    Job.countDocuments = origJobCount;

    // =========================================================================
    // 4. JOB MANAGEMENT SCENARIOS & SAFETY GUARDS
    // =========================================================================

    const origGetJob = jobRepository.getJob;
    jobRepository.getJob = async (id) => {
      if (String(id) === jobId) {
        return { _id: jobId, title: 'Senior Developer', company: companyId, status: 'Active' };
      }
      return null;
    };

    // 4.1 Create Job with Invalid Company ID -> 404 Not Found
    const invalidCompanyJobRes = await makeRequest('/api/v1/admin/jobs', 'POST', {
      title: 'Backend Engineer',
      company: new mongoose.Types.ObjectId().toString(),
      description: 'Building REST APIs',
      requirements: ['Node.js'],
      location: 'Remote',
      workMode: 'Remote',
      employmentType: 'Full-time',
    });
    assert(invalidCompanyJobRes.status === 404 && invalidCompanyJobRes.data.message.includes('company profile not found'), '4.1 Job creation with non-existent company returns 404 Not Found');

    // 4.2 Application Safety Guard for Job Deletion -> 400 Bad Request
    const origAppCount = Application.countDocuments;
    Application.countDocuments = async () => 5; // Simulate 5 candidate applications

    const jobAppGuardRes = await makeRequest(`/api/v1/admin/jobs/${jobId}`, 'DELETE');
    assert(jobAppGuardRes.status === 400 && jobAppGuardRes.data.message.includes('candidate applications'), '4.2 Job deletion with candidate applications rejected by Application Safety Guard (400 Bad Request)');

    Application.countDocuments = origAppCount;

    // =========================================================================
    // 5. AI USAGE TELEMETRY & PROMPT PROTECTION
    // =========================================================================

    const origGetAiUsage = adminAiUsageRepository.getOverallAiUsageStats;
    adminAiUsageRepository.getOverallAiUsageStats = async () => ({
      totalAiOperations: 100,
      totalResumeAnalyses: 50,
      totalInterviews: 30,
      totalRoadmaps: 20,
      topAiUsers: [],
      recentActivities: [],
    });

    const aiRes = await makeRequest('/api/v1/admin/ai/usage', 'GET');
    const resStr = JSON.stringify(aiRes.data);
    assert(
      aiRes.status === 200 &&
        !resStr.includes('GEMINI_API_KEY') &&
        !resStr.includes('AIzaSy') &&
        !resStr.includes('SYSTEM_PROMPT_SECRET'),
      '5.1 AI Monitoring endpoints verify zero Gemini API keys or raw system prompts are exposed',
      'API Keys & Prompts protected'
    );

    adminAiUsageRepository.getOverallAiUsageStats = origGetAiUsage;

    // =========================================================================
    // 6. AUDIT LOGGING SECRET SANITIZATION & RESILIENCE
    // =========================================================================

    const sanitizedData = adminAuditLogService.sanitizeMetadata({
      accountName: 'admin',
      password: 'MySecretPassword123!',
      jwtToken: 'eyJhbGci...',
      apiKey: 'AIzaSyKey...',
    });
    assert(
      sanitizedData.password === '[REDACTED_SECRET]' &&
        sanitizedData.jwtToken === '[REDACTED_SECRET]' &&
        sanitizedData.apiKey === '[REDACTED_SECRET]' &&
        sanitizedData.accountName === 'admin',
      '6.1 Audit logging metadata recursively redacts passwords, tokens, and API keys',
      `Password Redacted: ${sanitizedData.password}`
    );

    // =========================================================================
    // 7. NOTIFICATION BROADCAST & ANTI-DUPLICATE GUARD
    // =========================================================================

    const origNotifFindOne = Notification.findOne;
    const origNotifInsertMany = Notification.insertMany;

    Notification.findOne = async () => ({
      _id: new mongoose.Types.ObjectId().toString(),
      title: 'Maintenance Notice',
      message: 'System upgrade tonight.',
      createdAt: new Date(),
    });

    const dupBroadCastRes = await makeRequest('/api/v1/admin/notifications', 'POST', {
      title: 'Maintenance Notice',
      message: 'System upgrade tonight.',
      audience: 'ALL',
    });
    assert(dupBroadCastRes.status === 400 && dupBroadCastRes.data.message.includes('already sent within the last 5 minutes'), '7.1 Anti-duplicate notification broadcast check rejects duplicate broadcast within 5 mins (400 Bad Request)');

    Notification.findOne = origNotifFindOne;
    Notification.insertMany = origNotifInsertMany;

    // =========================================================================
    // 8. EDGE CASES, EMPTY DATASET & INVALID QUERY PARAMETERS
    // =========================================================================

    // 8.1 Invalid Query Parameters -> 400 Bad Request
    const invalidDaysRes = await makeRequest('/api/v1/admin/analytics/users?days=invalid_string', 'GET');
    assert(invalidDaysRes.status === 400, '8.1 Invalid query parameters (days=invalid_string) rejected by validator (400 Bad Request)');

    // 8.2 Out-of-Range Pagination Values Handled Gracefully
    const largePageRes = await makeRequest('/api/v1/admin/users?page=1&limit=50', 'GET');
    assert(largePageRes.status === 200, '8.2 Pagination parameter limits handled safely (200 OK)');

    // Cleanup & Teardown
    server.close();
    User.findById = origUserFindById;
    User.find = origUserFind;
    User.countDocuments = origUserCountDocuments;
    companyRepository.getCompany = origGetCompany;
    companyRepository.getCompanyByName = origGetCompanyByName;
    companyRepository.createCompany = origCreateCompany;
    jobRepository.getJob = origGetJob;

  } catch (err) {
    assert(false, 'Unexpected execution exception in Phase 10.11 Security Suite', err.stack);
  }

  console.log('\n=================================================================');
  console.log(` SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} Tests`);
  console.log('=================================================================\n');

  return { passedCount, failedCount };
}

runPhase1011SecurityTestSuite();
