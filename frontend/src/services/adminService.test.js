import { adminService } from './adminService.js';
import { api } from './api.js';

console.log('================================================================');
console.log('=== FRONTEND ADMIN SERVICE (F10.1) INTEGRATION TEST SUITE ===');
console.log('================================================================\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`[FAIL] ${message}`);
    testsFailed++;
  }
}

async function runTests() {
  const mockUserId = '65a1b2c3d4e5f6a7b8c9d001';
  const mockCompanyId = '65a1b2c3d4e5f6a7b8c9d002';
  const mockJobId = '65a1b2c3d4e5f6a7b8c9d003';
  const mockAppId = '65a1b2c3d4e5f6a7b8c9d004';
  const mockLogId = '65a1b2c3d4e5f6a7b8c9d005';
  const mockNotifId = '65a1b2c3d4e5f6a7b8c9d006';

  const originalGet = api.get;
  const originalPost = api.post;
  const originalPut = api.put;
  const originalPatch = api.patch;
  const originalDelete = api.delete;

  let capturedUrl = '';
  let capturedParams = null;
  let capturedBody = null;

  // ----------------------------------------------------------------
  // 1. HEALTH & DASHBOARD METRICS
  // ----------------------------------------------------------------
  console.log('--- 1. Testing System Health & Dashboard Metrics APIs ---');
  api.get = async (url) => {
    capturedUrl = url;
    return {
      data: {
        success: true,
        statusCode: 200,
        message: 'Admin authorization verified',
        data: { status: 'HEALTHY', adminUser: { id: mockUserId, role: 'Admin' } },
      },
    };
  };

  const healthRes = await adminService.getHealth();
  assert(capturedUrl === '/admin/health' && healthRes.data.status === 'HEALTHY', 'getHealth hits GET /admin/health');

  api.get = async (url) => {
    capturedUrl = url;
    return {
      data: {
        success: true,
        data: {
          overview: { users: { total: 150, active: 140 }, jobs: { total: 45 }, applications: { total: 320 } },
        },
      },
    };
  };
  const dashRes = await adminService.getDashboardOverview();
  assert(capturedUrl === '/admin/dashboard' && dashRes.data.overview.users.total === 150, 'getDashboardOverview hits GET /admin/dashboard');

  // ----------------------------------------------------------------
  // 2. USER MANAGEMENT APIs
  // ----------------------------------------------------------------
  console.log('\n--- 2. Testing Admin User Management APIs ---');
  api.get = async (url, config) => {
    capturedUrl = url;
    capturedParams = config?.params;
    return {
      data: {
        success: true,
        data: {
          users: [{ _id: mockUserId, email: 'candidate@test.com', role: 'Candidate', isActive: true }],
          pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
        },
      },
    };
  };

  const usersRes = await adminService.listUsers({ page: 1, limit: 10, role: 'Candidate', search: 'john' });
  assert(
    capturedUrl === '/admin/users' &&
      capturedParams.role === 'Candidate' &&
      capturedParams.search === 'john',
    'listUsers hits GET /admin/users with query parameters'
  );

  api.get = async (url) => {
    capturedUrl = url;
    return { data: { success: true, data: { _id: mockUserId, email: 'user@test.com' } } };
  };
  const userByIdRes = await adminService.getUserById(mockUserId);
  assert(capturedUrl === `/admin/users/${mockUserId}` && userByIdRes.data._id === mockUserId, 'getUserById hits GET /admin/users/:id');

  api.patch = async (url, body) => {
    capturedUrl = url;
    capturedBody = body;
    return { data: { success: true, data: { _id: mockUserId, isActive: body.isActive } } };
  };
  const statusRes = await adminService.updateUserStatus(mockUserId, { isActive: false });
  assert(
    capturedUrl === `/admin/users/${mockUserId}/status` && capturedBody.isActive === false,
    'updateUserStatus hits PATCH /admin/users/:id/status'
  );

  api.patch = async (url, body) => {
    capturedUrl = url;
    capturedBody = body;
    return { data: { success: true, data: { _id: mockUserId, role: body.role } } };
  };
  const roleRes = await adminService.updateUserRole(mockUserId, { role: 'Admin' });
  assert(
    capturedUrl === `/admin/users/${mockUserId}/role` && capturedBody.role === 'Admin',
    'updateUserRole hits PATCH /admin/users/:id/role'
  );

  api.delete = async (url) => {
    capturedUrl = url;
    return { data: { success: true, message: 'User account deleted successfully' } };
  };
  const delUserRes = await adminService.deleteUser(mockUserId);
  assert(capturedUrl === `/admin/users/${mockUserId}` && delUserRes.success === true, 'deleteUser hits DELETE /admin/users/:id');

  // ----------------------------------------------------------------
  // 3. COMPANY MANAGEMENT APIs
  // ----------------------------------------------------------------
  console.log('\n--- 3. Testing Admin Company Management APIs ---');
  api.get = async (url, config) => {
    capturedUrl = url;
    capturedParams = config?.params;
    return { data: { success: true, data: { companies: [{ _id: mockCompanyId, name: 'TechCorp' }] } } };
  };
  const compRes = await adminService.listCompanies({ search: 'Tech' });
  assert(capturedUrl === '/admin/companies' && capturedParams.search === 'Tech', 'listCompanies hits GET /admin/companies');

  api.post = async (url, body) => {
    capturedUrl = url;
    capturedBody = body;
    return { data: { success: true, statusCode: 201, data: { company: { _id: mockCompanyId, name: body.name } } } };
  };
  const createCompRes = await adminService.createCompany({ name: 'Acme Inc', industry: 'Technology' });
  assert(capturedUrl === '/admin/companies' && capturedBody.name === 'Acme Inc', 'createCompany hits POST /admin/companies');

  api.put = async (url, body) => {
    capturedUrl = url;
    capturedBody = body;
    return { data: { success: true, data: { company: { _id: mockCompanyId, name: body.name } } } };
  };
  const updateCompRes = await adminService.updateCompany(mockCompanyId, { name: 'Acme Global' });
  assert(capturedUrl === `/admin/companies/${mockCompanyId}` && capturedBody.name === 'Acme Global', 'updateCompany hits PUT /admin/companies/:id');

  api.patch = async (url, body) => {
    capturedUrl = url;
    capturedBody = body;
    return { data: { success: true, data: { company: { _id: mockCompanyId, hiringStatus: body.hiringStatus } } } };
  };
  const statusCompRes = await adminService.updateCompanyStatus(mockCompanyId, { hiringStatus: 'Hiring' });
  assert(
    capturedUrl === `/admin/companies/${mockCompanyId}/status` && capturedBody.hiringStatus === 'Hiring',
    'updateCompanyStatus hits PATCH /admin/companies/:id/status'
  );

  api.delete = async (url) => {
    capturedUrl = url;
    return { data: { success: true, message: 'Company deleted' } };
  };
  const delCompRes = await adminService.deleteCompany(mockCompanyId);
  assert(capturedUrl === `/admin/companies/${mockCompanyId}` && delCompRes.success === true, 'deleteCompany hits DELETE /admin/companies/:id');

  // ----------------------------------------------------------------
  // 4. JOB MANAGEMENT APIs
  // ----------------------------------------------------------------
  console.log('\n--- 4. Testing Admin Job Management APIs ---');
  api.get = async (url, config) => {
    capturedUrl = url;
    capturedParams = config?.params;
    return { data: { success: true, data: { jobs: [{ _id: mockJobId, title: 'Frontend Engineer' }] } } };
  };
  const jobsRes = await adminService.listJobs({ status: 'active' });
  assert(capturedUrl === '/admin/jobs' && capturedParams.status === 'active', 'listJobs hits GET /admin/jobs');

  api.post = async (url, body) => {
    capturedUrl = url;
    capturedBody = body;
    return { data: { success: true, statusCode: 201, data: { job: { _id: mockJobId, title: body.title } } } };
  };
  const createJobRes = await adminService.createJob({ title: 'Fullstack Dev', companyId: mockCompanyId });
  assert(capturedUrl === '/admin/jobs' && capturedBody.title === 'Fullstack Dev', 'createJob hits POST /admin/jobs');

  api.patch = async (url, body) => {
    capturedUrl = url;
    capturedBody = body;
    return { data: { success: true, data: { job: { _id: mockJobId, status: body.status } } } };
  };
  const jobStatusRes = await adminService.updateJobStatus(mockJobId, { status: 'paused' });
  assert(capturedUrl === `/admin/jobs/${mockJobId}/status` && capturedBody.status === 'paused', 'updateJobStatus hits PATCH /admin/jobs/:id/status');

  api.delete = async (url) => {
    capturedUrl = url;
    return { data: { success: true, message: 'Job deleted' } };
  };
  const delJobRes = await adminService.deleteJob(mockJobId);
  assert(capturedUrl === `/admin/jobs/${mockJobId}` && delJobRes.success === true, 'deleteJob hits DELETE /admin/jobs/:id');

  // ----------------------------------------------------------------
  // 5. APPLICATION MONITORING APIs
  // ----------------------------------------------------------------
  console.log('\n--- 5. Testing Application Monitoring APIs ---');
  api.get = async (url) => {
    capturedUrl = url;
    return { data: { success: true, data: { totalApplications: 450, conversionRate: '12.5%' } } };
  };
  const appStatsRes = await adminService.getApplicationStats();
  assert(capturedUrl === '/admin/applications/statistics' && appStatsRes.data.totalApplications === 450, 'getApplicationStats hits GET /admin/applications/statistics');

  api.get = async (url) => {
    capturedUrl = url;
    return { data: { success: true, data: { applications: [{ _id: mockAppId }] } } };
  };
  const appListRes = await adminService.listApplications({ status: 'submitted' });
  assert(capturedUrl === '/admin/applications', 'listApplications hits GET /admin/applications');

  // ----------------------------------------------------------------
  // 6. AI TELEMETRY & ANALYTICS APIs
  // ----------------------------------------------------------------
  console.log('\n--- 6. Testing AI Telemetry & Platform Analytics APIs ---');
  api.get = async (url) => {
    capturedUrl = url;
    return { data: { success: true, data: { totalCalls: 1200, totalTokens: 450000, totalCostUsd: '0.67' } } };
  };
  const aiUsageRes = await adminService.getOverallAiUsage();
  assert(capturedUrl === '/admin/ai/usage' && aiUsageRes.data.totalCalls === 1200, 'getOverallAiUsage hits GET /admin/ai/usage');

  const resumeUsageRes = await adminService.getResumeAnalysisAiUsage();
  assert(capturedUrl === '/admin/ai/resume-analysis', 'getResumeAnalysisAiUsage hits GET /admin/ai/resume-analysis');

  const interviewUsageRes = await adminService.getInterviewAiUsage();
  assert(capturedUrl === '/admin/ai/interviews', 'getInterviewAiUsage hits GET /admin/ai/interviews');

  const roadmapUsageRes = await adminService.getRoadmapAiUsage();
  assert(capturedUrl === '/admin/ai/roadmaps', 'getRoadmapAiUsage hits GET /admin/ai/roadmaps');

  const userAnalRes = await adminService.getUserAnalytics();
  assert(capturedUrl === '/admin/analytics/users', 'getUserAnalytics hits GET /admin/analytics/users');

  const jobAnalRes = await adminService.getJobAnalytics();
  assert(capturedUrl === '/admin/analytics/jobs', 'getJobAnalytics hits GET /admin/analytics/jobs');

  const appAnalRes = await adminService.getApplicationAnalytics();
  assert(capturedUrl === '/admin/analytics/applications', 'getApplicationAnalytics hits GET /admin/analytics/applications');

  const aiAnalRes = await adminService.getAiAnalytics();
  assert(capturedUrl === '/admin/analytics/ai', 'getAiAnalytics hits GET /admin/analytics/ai');

  // ----------------------------------------------------------------
  // 7. AUDIT LOGGING & SYSTEM ANNOUNCEMENTS APIs
  // ----------------------------------------------------------------
  console.log('\n--- 7. Testing Audit Logs & System Announcement APIs ---');
  api.get = async (url) => {
    capturedUrl = url;
    return { data: { success: true, data: { auditLogs: [{ _id: mockLogId, action: 'USER_DEACTIVATED' }] } } };
  };
  const logsRes = await adminService.listAuditLogs();
  assert(capturedUrl === '/admin/audit-logs' && logsRes.data.auditLogs[0]._id === mockLogId, 'listAuditLogs hits GET /admin/audit-logs');

  api.get = async (url) => {
    capturedUrl = url;
    return { data: { success: true, data: { auditLog: { _id: mockLogId, action: 'USER_DEACTIVATED' } } } };
  };
  const logByIdRes = await adminService.getAuditLogById(mockLogId);
  assert(capturedUrl === `/admin/audit-logs/${mockLogId}`, 'getAuditLogById hits GET /admin/audit-logs/:id');

  api.post = async (url, body) => {
    capturedUrl = url;
    capturedBody = body;
    return { data: { success: true, statusCode: 201, data: { announcement: { title: body.title }, recipientCount: 150 } } };
  };
  const announceRes = await adminService.sendAnnouncement({ title: 'Maintenance Alert', message: 'System update tonight', audience: 'ALL' });
  assert(capturedUrl === '/admin/notifications' && capturedBody.title === 'Maintenance Alert', 'sendAnnouncement hits POST /admin/notifications');

  api.delete = async (url) => {
    capturedUrl = url;
    return { data: { success: true, message: 'Notification deleted' } };
  };
  const delNotifRes = await adminService.deleteNotification(mockNotifId);
  assert(capturedUrl === `/admin/notifications/${mockNotifId}` && delNotifRes.success === true, 'deleteNotification hits DELETE /admin/notifications/:id');

  // ----------------------------------------------------------------
  // 8. ERROR STATUS CODE PROPAGATION
  // ----------------------------------------------------------------
  console.log('\n--- 8. Testing Error Status Code Handling ---');
  const errorStatuses = [401, 403, 404, 409, 422, 429, 500];

  for (const statusCode of errorStatuses) {
    api.get = async () => {
      const err = new Error(`HTTP Error ${statusCode}`);
      err.response = { status: statusCode, data: { success: false, statusCode, message: `Error ${statusCode}` } };
      throw err;
    };

    let caughtErr = null;
    try {
      await adminService.getDashboardOverview();
    } catch (e) {
      caughtErr = e;
    }
    assert(caughtErr && caughtErr.response.status === statusCode, `Propagates HTTP ${statusCode} error status code cleanly`);
  }

  // Restore mocks
  api.get = originalGet;
  api.post = originalPost;
  api.put = originalPut;
  api.patch = originalPatch;
  api.delete = originalDelete;

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('================================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Unhandled test runner error:', err);
  process.exit(1);
});
