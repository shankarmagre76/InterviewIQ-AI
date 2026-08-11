import express from 'express';
import mongoose from 'mongoose';
import routes from '../routes/index.js';
import errorHandler from '../middleware/error.middleware.js';
import { generateAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import adminAnalyticsRepository from './adminAnalytics.repository.js';
import adminAiUsageRepository from './adminAiUsage.repository.js';

console.log('=================================================================');
console.log('  INTERVIEWIQ AI - PHASE 10.7 ADMIN ANALYTICS TEST SUITE');
console.log('=================================================================\n');

async function runAdminAnalyticsTestSuite() {
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
    const origUserFind = User.find;

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

    User.find = (filter = {}) => ({
      select: () => ({
        lean: async () => [
          { _id: studentId, firstName: 'Alice', lastName: 'Student', email: 'alice@example.com', role: 'Student' },
        ],
      }),
    });

    // Stub Repository Methods
    const origGetDashboardSummary = adminAnalyticsRepository.getDashboardSummary;
    const origGetUserAnalytics = adminAnalyticsRepository.getUserAnalytics;
    const origGetJobAnalytics = adminAnalyticsRepository.getJobAnalytics;
    const origGetApplicationAnalytics = adminAnalyticsRepository.getApplicationAnalytics;
    const origGetOverallAi = adminAiUsageRepository.getOverallAiUsageStats;

    adminAnalyticsRepository.getDashboardSummary = async () => ({
      users: {
        totalUsers: 100,
        activeUsers: 90,
        inactiveUsers: 10,
        newUsersLast30Days: 25,
        userRoleBreakdown: [
          { _id: 'Student', count: 70 },
          { _id: 'Recruiter', count: 25 },
          { _id: 'Admin', count: 5 },
        ],
      },
      resumes: { totalResumes: 80, totalResumeAnalyses: 65, avgAtsScore: 78.5 },
      interviews: { totalInterviews: 50, completedInterviews: 40, avgInterviewScore: 82.3 },
      jobs: { totalCompanies: 15, activelyHiringCompanies: 12, totalJobs: 45, activeJobs: 30 },
      applications: {
        totalApplications: 120,
        applicationStatusBreakdown: [
          { _id: 'Applied', count: 40 },
          { _id: 'Under Review', count: 30 },
          { _id: 'Interview Scheduled', count: 20 },
          { _id: 'Offered', count: 10 },
          { _id: 'Rejected', count: 20 },
        ],
      },
      roadmaps: { totalRoadmaps: 35, activeRoadmaps: 25, completedRoadmaps: 10 },
      notifications: { totalNotifications: 200, readNotifications: 150, unreadNotifications: 50 },
    });

    adminAnalyticsRepository.getUserAnalytics = async (days = 30) => ({
      totalUsers: 100,
      activeUsers: 90,
      inactiveUsers: 10,
      roleBreakdown: [
        { role: 'Student', count: 70 },
        { role: 'Recruiter', count: 25 },
        { role: 'Admin', count: 5 },
      ],
      dailyGrowth: [
        { date: '2026-02-01', count: 5 },
        { date: '2026-02-02', count: 8 },
      ],
    });

    adminAnalyticsRepository.getJobAnalytics = async () => ({
      companies: {
        totalCompanies: 15,
        statusBreakdown: [{ status: 'Actively Hiring', count: 12 }, { status: 'Hiring Freeze', count: 3 }],
      },
      jobs: {
        totalJobs: 45,
        statusBreakdown: [{ status: 'Active', count: 30 }, { status: 'Closed', count: 15 }],
        workModeBreakdown: [{ workMode: 'Remote', count: 25 }, { workMode: 'Hybrid', count: 20 }],
        employmentTypeBreakdown: [{ employmentType: 'Full-time', count: 40 }, { employmentType: 'Contract', count: 5 }],
        dailyPostingsTrend: [{ date: '2026-02-01', count: 3 }],
      },
    });

    adminAnalyticsRepository.getApplicationAnalytics = async () => ({
      totalApplications: 120,
      statusBreakdown: [
        { status: 'Applied', count: 40 },
        { status: 'Interview Scheduled', count: 20 },
        { status: 'Offered', count: 10 },
      ],
      dailyVolumeTrend: [{ date: '2026-02-01', count: 12 }],
    });

    adminAiUsageRepository.getOverallAiUsageStats = async () => ({
      totalAiOperations: 150,
      totalResumeAnalyses: 65,
      totalInterviews: 50,
      totalRoadmaps: 35,
      topAiUsers: [{ userId: studentId, totalCount: 15, resumeCount: 5, interviewCount: 5, roadmapCount: 5 }],
      recentActivities: [],
    });

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
    // EXECUTE ADMIN ANALYTICS TEST SCENARIOS
    // =========================================================================

    // 1. Dashboard Overview (GET /api/v1/admin/dashboard)
    const dashRes = await makeRequest('/api/v1/admin/dashboard', 'GET');
    assert(
      dashRes.status === 200 &&
        dashRes.data.success === true &&
        dashRes.data.data.users.totalUsers === 100 &&
        dashRes.data.data.resumes.avgAtsScore === 78.5 &&
        dashRes.data.data.applications.interviewConversionRatePercent === 16.67 &&
        dashRes.data.data.applications.offerConversionRatePercent === 8.33,
      'Test 1: Admin can retrieve comprehensive dashboard summary KPIs and conversion rates',
      `Users: ${dashRes.data.data?.users?.totalUsers}, InterviewRate: ${dashRes.data.data?.applications?.interviewConversionRatePercent}%`
    );

    // 2. User Growth Analytics (GET /api/v1/admin/analytics/users)
    const userAnalyticsRes = await makeRequest('/api/v1/admin/analytics/users?days=30', 'GET');
    assert(
      userAnalyticsRes.status === 200 &&
        userAnalyticsRes.data.data.totalUsers === 100 &&
        userAnalyticsRes.data.data.dailyGrowth.length === 2,
      'Test 2: Admin can retrieve user growth trend time-series and role distribution',
      `Daily Trend Count: ${userAnalyticsRes.data.data?.dailyGrowth?.length}`
    );

    // 3. Job & Company Analytics (GET /api/v1/admin/analytics/jobs)
    const jobAnalyticsRes = await makeRequest('/api/v1/admin/analytics/jobs', 'GET');
    assert(
      jobAnalyticsRes.status === 200 &&
        jobAnalyticsRes.data.data.jobs.totalJobs === 45 &&
        jobAnalyticsRes.data.data.jobs.workModeBreakdown.length === 2,
      'Test 3: Admin can retrieve job and company analytics with workMode & employmentType breakdowns',
      `Total Jobs: ${jobAnalyticsRes.data.data?.jobs?.totalJobs}`
    );

    // 4. Application Funnel Analytics (GET /api/v1/admin/analytics/applications)
    const appAnalyticsRes = await makeRequest('/api/v1/admin/analytics/applications', 'GET');
    assert(
      appAnalyticsRes.status === 200 &&
        appAnalyticsRes.data.data.totalApplications === 120 &&
        appAnalyticsRes.data.data.conversionMetrics.interviewConversionRatePercent === 16.67,
      'Test 4: Admin can retrieve application funnel analytics & status distribution',
      `Total Apps: ${appAnalyticsRes.data.data?.totalApplications}`
    );

    // 5. AI Consumption Analytics (GET /api/v1/admin/analytics/ai)
    const aiAnalyticsRes = await makeRequest('/api/v1/admin/analytics/ai', 'GET');
    assert(
      aiAnalyticsRes.status === 200 &&
        aiAnalyticsRes.data.data.overview.totalAiOperations === 150 &&
        aiAnalyticsRes.data.data.overview.featureDistribution.resumeAnalysisPercent === 43.33,
      'Test 5: Admin can retrieve platform-wide AI consumption analytics and feature distribution',
      `Total AI Ops: ${aiAnalyticsRes.data.data?.overview?.totalAiOperations}`
    );

    // 6. Zero / Empty Dataset Handling Test
    adminAnalyticsRepository.getDashboardSummary = async () => ({
      users: { totalUsers: 0, activeUsers: 0, inactiveUsers: 0, newUsersLast30Days: 0, userRoleBreakdown: [] },
      resumes: { totalResumes: 0, totalResumeAnalyses: 0, avgAtsScore: 0 },
      interviews: { totalInterviews: 0, completedInterviews: 0, avgInterviewScore: 0 },
      jobs: { totalCompanies: 0, activelyHiringCompanies: 0, totalJobs: 0, activeJobs: 0 },
      applications: { totalApplications: 0, applicationStatusBreakdown: [] },
      roadmaps: { totalRoadmaps: 0, activeRoadmaps: 0, completedRoadmaps: 0 },
      notifications: { totalNotifications: 0, readNotifications: 0, unreadNotifications: 0 },
    });

    const emptyDashRes = await makeRequest('/api/v1/admin/dashboard', 'GET');
    assert(
      emptyDashRes.status === 200 &&
        emptyDashRes.data.data.users.totalUsers === 0 &&
        emptyDashRes.data.data.applications.interviewConversionRatePercent === 0,
      'Test 6: Empty dataset scenario is handled cleanly with zero rates and empty arrays',
      `Users: ${emptyDashRes.data.data?.users?.totalUsers}`
    );

    // 7. Authorization Check: Non-Admin Normal User (Student) -> 403 Forbidden
    const forbiddenRes = await makeRequest('/api/v1/admin/dashboard', 'GET', null, studentToken);
    assert(
      forbiddenRes.status === 403,
      'Test 7: Normal non-admin user request returns HTTP 403 Forbidden',
      `Status: ${forbiddenRes.status}`
    );

    // 8. Authentication Check: Missing JWT -> 401 Unauthorized
    const unauthRes = await makeRequest('/api/v1/admin/dashboard', 'GET', null, null);
    assert(
      unauthRes.status === 401,
      'Test 8: Unauthenticated request without JWT returns HTTP 401 Unauthorized',
      `Status: ${unauthRes.status}`
    );

    // Cleanup & Teardown
    server.close();
    User.findById = origUserFindById;
    User.find = origUserFind;
    adminAnalyticsRepository.getDashboardSummary = origGetDashboardSummary;
    adminAnalyticsRepository.getUserAnalytics = origGetUserAnalytics;
    adminAnalyticsRepository.getJobAnalytics = origGetJobAnalytics;
    adminAnalyticsRepository.getApplicationAnalytics = origGetApplicationAnalytics;
    adminAiUsageRepository.getOverallAiUsageStats = origGetOverallAi;

  } catch (err) {
    assert(false, 'Unexpected execution exception in Admin Analytics Suite', err.stack);
  }

  console.log('\n=================================================================');
  console.log(` SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} Tests`);
  console.log('=================================================================\n');

  return { passedCount, failedCount };
}

runAdminAnalyticsTestSuite();
