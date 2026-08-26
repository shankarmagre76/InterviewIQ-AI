import express from 'express';
import mongoose from 'mongoose';
import routes from '../routes/index.js';
import errorHandler from '../middleware/error.middleware.js';
import { generateAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import Application from '../application/application.model.js';
import adminApplicationRepository from './adminApplication.repository.js';

console.log('=================================================================');
console.log('  INTERVIEWIQ AI - PHASE 10.5 ADMIN APPLICATION MONITORING TEST SUITE');
console.log('=================================================================\n');

async function runAdminApplicationMonitoringTestSuite() {
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

    // In-memory Mock Applications Store
    const mockApps = [
      {
        _id: new mongoose.Types.ObjectId().toString(),
        user: studentId,
        job: jobId,
        company: companyId,
        status: 'Applied',
        appliedAt: new Date('2026-02-01T10:00:00Z'),
      },
      {
        _id: new mongoose.Types.ObjectId().toString(),
        user: studentId,
        job: jobId,
        company: companyId,
        status: 'Interview Scheduled',
        appliedAt: new Date('2026-02-02T10:00:00Z'),
      },
      {
        _id: new mongoose.Types.ObjectId().toString(),
        user: studentId,
        job: jobId,
        company: companyId,
        status: 'Offered',
        appliedAt: new Date('2026-02-03T10:00:00Z'),
      },
      {
        _id: new mongoose.Types.ObjectId().toString(),
        user: studentId,
        job: jobId,
        company: companyId,
        status: 'Rejected',
        appliedAt: new Date('2026-02-04T10:00:00Z'),
      },
    ];

    // Stub Repository methods
    const origListApplications = adminApplicationRepository.listApplications;
    const origGetApplicationById = adminApplicationRepository.getApplicationById;
    const origGetApplicationStatistics = adminApplicationRepository.getApplicationStatistics;

    adminApplicationRepository.listApplications = async (filter = {}, options = {}) => {
      let filtered = [...mockApps];

      if (filter.status) {
        filtered = filtered.filter((a) => a.status === filter.status);
      }
      if (filter.company) {
        filtered = filtered.filter((a) => String(a.company) === String(filter.company));
      }
      if (filter.job) {
        filtered = filtered.filter((a) => String(a.job) === String(filter.job));
      }
      if (filter.appliedAt) {
        if (filter.appliedAt.$gte) {
          filtered = filtered.filter((a) => new Date(a.appliedAt) >= filter.appliedAt.$gte);
        }
        if (filter.appliedAt.$lte) {
          filtered = filtered.filter((a) => new Date(a.appliedAt) <= filter.appliedAt.$lte);
        }
      }

      const page = options.page || 1;
      const limit = options.limit || 10;
      const skip = (page - 1) * limit;

      return {
        applications: filtered.slice(skip, skip + limit),
        total: filtered.length,
        page,
        totalPages: Math.ceil(filtered.length / limit) || 1,
      };
    };

    adminApplicationRepository.getApplicationById = async (id) => {
      const found = mockApps.find((a) => String(a._id) === String(id));
      if (!found) return null;
      return {
        ...found,
        user: { _id: studentId, firstName: 'Alice', lastName: 'Student', email: 'alice@example.com' },
        job: { _id: jobId, title: 'Senior Backend Engineer' },
        company: { _id: companyId, companyName: 'Acme Corp' },
      };
    };

    adminApplicationRepository.getApplicationStatistics = async (filter = {}) => {
      let filtered = [...mockApps];

      if (filter.status) filtered = filtered.filter((a) => a.status === filter.status);
      if (filter.company) filtered = filtered.filter((a) => String(a.company) === String(filter.company));
      if (filter.appliedAt) {
        if (filter.appliedAt.$gte) filtered = filtered.filter((a) => new Date(a.appliedAt) >= filter.appliedAt.$gte);
        if (filter.appliedAt.$lte) filtered = filtered.filter((a) => new Date(a.appliedAt) <= filter.appliedAt.$lte);
      }

      const total = filtered.length;

      // Calculate status breakdown
      const statusMap = {};
      filtered.forEach((a) => {
        statusMap[a.status] = (statusMap[a.status] || 0) + 1;
      });
      const statusBreakdown = Object.keys(statusMap).map((k) => ({ _id: k, count: statusMap[k] }));

      const topCompanies = total > 0 ? [{ _id: companyId, count: total, companyName: 'Acme Corp' }] : [];
      const topJobs = total > 0 ? [{ _id: jobId, count: total, title: 'Senior Backend Engineer' }] : [];
      const recentApplications = filtered.slice(-5).reverse().map((a) => ({
        _id: a._id,
        status: a.status,
        appliedAt: a.appliedAt,
        candidateName: 'Alice Student',
        companyName: 'Acme Corp',
        jobTitle: 'Senior Backend Engineer',
      }));

      return {
        total,
        statusBreakdown,
        topCompanies,
        topJobs,
        recentApplications,
      };
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
    // EXECUTE ADMIN APPLICATION MONITORING TEST SCENARIOS
    // =========================================================================

    // 1. Get Application Statistics (GET /api/v1/admin/applications/statistics)
    const statsRes = await makeRequest('/api/v1/admin/applications/statistics', 'GET');
    assert(
      statsRes.status === 200 &&
        statsRes.data.success === true &&
        statsRes.data.data.totalApplications === 4 &&
        statsRes.data.data.conversionMetrics.interviewRatePercent === 25 &&
        statsRes.data.data.conversionMetrics.offerRatePercent === 25,
      'Test 1: Admin can retrieve platform-wide application statistics & conversion rates',
      `Total: ${statsRes.data.data?.totalApplications}, OfferRate: ${statsRes.data.data?.conversionMetrics?.offerRatePercent}%`
    );

    // 2. Statistics with Filtered Date Range
    const dateStatsRes = await makeRequest(
      '/api/v1/admin/applications/statistics?dateFrom=2026-02-01T00:00:00Z&dateTo=2026-02-02T23:59:59Z',
      'GET'
    );
    assert(
      dateStatsRes.status === 200 && dateStatsRes.data.data.totalApplications === 2,
      'Test 2: Admin can filter statistics by date range (dateFrom / dateTo)',
      `Filtered Total: ${dateStatsRes.data.data?.totalApplications}`
    );

    // 3. Zero Applications Statistics Handling
    const origGetStats = adminApplicationRepository.getApplicationStatistics;
    adminApplicationRepository.getApplicationStatistics = async () => ({
      total: 0,
      statusBreakdown: [],
      topCompanies: [],
      topJobs: [],
      recentApplications: [],
    });

    const zeroStatsRes = await makeRequest('/api/v1/admin/applications/statistics', 'GET');
    assert(
      zeroStatsRes.status === 200 &&
        zeroStatsRes.data.data.totalApplications === 0 &&
        zeroStatsRes.data.data.conversionMetrics.interviewRatePercent === 0 &&
        zeroStatsRes.data.data.conversionMetrics.offerRatePercent === 0,
      'Test 3: Zero applications scenario is handled safely without division-by-zero errors',
      `OfferRate: ${zeroStatsRes.data.data?.conversionMetrics?.offerRatePercent}%`
    );

    // Restore origGetStats
    adminApplicationRepository.getApplicationStatistics = origGetStats;

    // 4. List Applications (GET /api/v1/admin/applications)
    const listRes = await makeRequest('/api/v1/admin/applications?page=1&limit=10', 'GET');
    assert(
      listRes.status === 200 && listRes.data.success === true && listRes.data.meta.total === 4,
      'Test 4: Admin can list platform-wide applications with pagination metadata',
      `Total: ${listRes.data.meta?.total}`
    );

    // 5. Filter Applications by Status
    const statusListRes = await makeRequest('/api/v1/admin/applications?status=Offered', 'GET');
    assert(
      statusListRes.status === 200 && statusListRes.data.data.length === 1 && statusListRes.data.data[0].status === 'Offered',
      'Test 5: Admin can filter applications list by status (Offered)',
      `Status: ${statusListRes.data.data?.[0]?.status}`
    );

    // 6. View Application Details (GET /api/v1/admin/applications/:id)
    const firstAppId = mockApps[0]._id;
    const detailRes = await makeRequest(`/api/v1/admin/applications/${firstAppId}`, 'GET');
    assert(
      detailRes.status === 200 &&
        detailRes.data.data.user.email === 'alice@example.com' &&
        detailRes.data.data.job.title === 'Senior Backend Engineer',
      'Test 6: Admin can view single application details with populated candidate & job info',
      `Candidate Email: ${detailRes.data.data?.user?.email}`
    );

    // 7. Non-existent Application ID -> 404 Not Found
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const notFoundRes = await makeRequest(`/api/v1/admin/applications/${nonExistentId}`, 'GET');
    assert(
      notFoundRes.status === 404 && notFoundRes.data.message.includes('not found'),
      'Test 7: Non-existent application ID returns 404 Not Found',
      `Message: ${notFoundRes.data.message}`
    );

    // 8. Invalid Application ObjectId Format -> 400 Bad Request
    const invalidIdRes = await makeRequest('/api/v1/admin/applications/not-a-mongo-id', 'GET');
    assert(
      invalidIdRes.status === 400,
      'Test 8: Invalid MongoDB Application ID format returns 400 Bad Request',
      `Status: ${invalidIdRes.status}`
    );

    // 9. Authorization Check: Non-Admin Normal User (Student) -> 403 Forbidden
    const forbiddenRes = await makeRequest('/api/v1/admin/applications', 'GET', null, studentToken);
    assert(
      forbiddenRes.status === 403,
      'Test 9: Normal non-admin user request returns HTTP 403 Forbidden',
      `Status: ${forbiddenRes.status}`
    );

    // 10. Authentication Check: Missing JWT -> 401 Unauthorized
    const unauthRes = await makeRequest('/api/v1/admin/applications', 'GET', null, null);
    assert(
      unauthRes.status === 401,
      'Test 10: Unauthenticated request without JWT returns HTTP 401 Unauthorized',
      `Status: ${unauthRes.status}`
    );

    // Cleanup & Teardown
    server.close();
    User.findById = origUserFindById;
    adminApplicationRepository.listApplications = origListApplications;
    adminApplicationRepository.getApplicationById = origGetApplicationById;
    adminApplicationRepository.getApplicationStatistics = origGetApplicationStatistics;

  } catch (err) {
    assert(false, 'Unexpected execution exception in Admin Application Suite', err.stack);
  }

  console.log('\n=================================================================');
  console.log(` SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} Tests`);
  console.log('=================================================================\n');

  return { passedCount, failedCount };
}

runAdminApplicationMonitoringTestSuite();
