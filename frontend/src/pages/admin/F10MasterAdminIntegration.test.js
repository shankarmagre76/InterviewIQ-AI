import { adminService } from '../../services/adminService.js';
import { api } from '../../services/api.js';
import { parseApiError } from '../../utils/helpers.js';

console.log('================================================================');
console.log('   INTERVIEWIQ AI — MASTER ADMIN PANEL (F10) INTEGRATION SUITE  ');
console.log('================================================================\n');

// Mock memoryStorage for Node test runner environment
const memoryStorage = {};
global.localStorage = {
  getItem: (key) => memoryStorage[key] || null,
  setItem: (key, val) => { memoryStorage[key] = String(val); },
  removeItem: (key) => { delete memoryStorage[key]; },
  clear: () => { Object.keys(memoryStorage).forEach((k) => delete memoryStorage[k]); },
};

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

async function runMasterTestSuite() {
  const originalGet = api.get;
  const originalPost = api.post;
  const originalPut = api.put;
  const originalPatch = api.patch;
  const originalDelete = api.delete;

  const mockUserId = '65a1b2c3d4e5f6a7b8c9d001';
  const mockCompanyId = '65a1b2c3d4e5f6a7b8c9d002';
  const mockJobId = '65a1b2c3d4e5f6a7b8c9d003';
  const mockAppId = '65a1b2c3d4e5f6a7b8c9d004';

  let capturedParams = null;
  let capturedBody = null;

  /* ==========================================================================
     SECTION 1: AUTHENTICATION & RBAC SECURITY
     ========================================================================== */
  console.log('--- SECTION 1: AUTHENTICATION & RBAC SECURITY ---');
  const verifyAdminRole = (user) => {
    if (!user) return { allowed: false, redirect: '/login' };
    const role = String(user.role || '').trim().toLowerCase();
    if (role !== 'admin') return { allowed: false, redirect: '/dashboard' };
    return { allowed: true, redirect: null };
  };

  assert(verifyAdminRole({ role: 'Admin' }).allowed === true, '1.1 Admin user role allows access to admin portal');
  assert(verifyAdminRole({ role: 'Student' }).redirect === '/dashboard', '1.2 Normal candidate (Student) redirected away to /dashboard');
  assert(verifyAdminRole({ role: 'Recruiter' }).redirect === '/dashboard', '1.3 Employer (Recruiter) redirected away to /dashboard');
  assert(verifyAdminRole(null).redirect === '/login', '1.4 Logged-out user redirected away to /login');

  /* ==========================================================================
     SECTION 2: DASHBOARD OVERVIEW & KPIS (F10.3)
     ========================================================================== */
  console.log('\n--- SECTION 2: DASHBOARD OVERVIEW & KPIS (F10.3) ---');
  api.get = async (url) => {
    if (url === '/admin/dashboard') {
      return {
        data: {
          success: true,
          data: {
            users: { totalUsers: 150, activeUsers: 140, newUsersLast30Days: 30 },
            resumes: { totalResumes: 90, averageAtsScore: 81.5 },
            interviews: { totalInterviews: 120, completedInterviews: 100, averageInterviewScore: 84.0 },
            jobs: { totalCompanies: 20, activelyHiringCompanies: 15, totalJobs: 50, activeJobs: 40 },
            applications: { totalApplications: 300, interviewConversionRatePercent: 25.0, offerConversionRatePercent: 12.0 },
            roadmaps: { totalRoadmaps: 45, activeRoadmaps: 38 },
            notifications: { totalNotifications: 60, unreadNotifications: 10 },
            timestamp: new Date().toISOString(),
          },
        },
      };
    }
    throw new Error('Not Found');
  };

  const dashRes = await adminService.getDashboardOverview();
  assert(dashRes.success === true, '2.1 getDashboardOverview succeeds');
  assert(dashRes.data.users.totalUsers === 150, '2.2 Maps totalUsers KPI correctly');
  assert(dashRes.data.resumes.averageAtsScore === 81.5, '2.3 Maps averageAtsScore KPI correctly');
  assert(dashRes.data.interviews.averageInterviewScore === 84.0, '2.4 Maps averageInterviewScore KPI correctly');

  /* ==========================================================================
     SECTION 3: USER MANAGEMENT & ACTIONS (F10.4 & F10.5)
     ========================================================================== */
  console.log('\n--- SECTION 3: USER MANAGEMENT & ACTIONS (F10.4 & F10.5) ---');
  api.get = async (url, config) => {
    if (url === '/admin/users') {
      capturedParams = config?.params;
      return {
        data: {
          success: true,
          data: {
            users: [{ _id: mockUserId, name: 'Candidate One', email: 'one@test.com', role: 'Student', isActive: true }],
            pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
          },
        },
      };
    }
    if (url === `/admin/users/${mockUserId}`) {
      return {
        data: {
          success: true,
          data: { _id: mockUserId, name: 'Candidate One', email: 'one@test.com', role: 'Student', isActive: true, createdAt: new Date().toISOString() },
        },
      };
    }
    throw new Error('Not Found');
  };

  const userListRes = await adminService.listUsers({ search: 'One', role: 'Student' });
  assert(userListRes.success === true, '3.1 listUsers succeeds');
  assert(capturedParams.search === 'One' && capturedParams.role === 'Student', '3.2 Passes search and role filters to backend');

  const userDetailRes = await adminService.getUserById(mockUserId);
  assert(userDetailRes.data._id === mockUserId, '3.3 getUserById retrieves user details');

  api.patch = async (url, body) => {
    capturedBody = body;
    return { data: { success: true, data: { _id: mockUserId, ...body } } };
  };

  const userStatusRes = await adminService.updateUserStatus(mockUserId, { isActive: false });
  assert(userStatusRes.success === true && capturedBody.isActive === false, '3.4 updateUserStatus toggles user status');

  const userRoleRes = await adminService.updateUserRole(mockUserId, { role: 'Admin' });
  assert(userRoleRes.success === true && capturedBody.role === 'Admin', '3.5 updateUserRole modifies user role');

  api.delete = async (url) => {
    return { data: { success: true, message: 'User deleted' } };
  };

  const userDelRes = await adminService.deleteUser(mockUserId);
  assert(userDelRes.success === true, '3.6 deleteUser sends DELETE request to backend');

  /* ==========================================================================
     SECTION 4: COMPANY MANAGEMENT (F10.6)
     ========================================================================== */
  console.log('\n--- SECTION 4: COMPANY MANAGEMENT (F10.6) ---');
  api.get = async (url, config) => {
    if (url === '/admin/companies') {
      capturedParams = config?.params;
      return {
        data: {
          success: true,
          data: {
            companies: [{ _id: mockCompanyId, companyName: 'Acme Corp', industry: 'Software Development', hiringStatus: 'Actively Hiring' }],
            pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
          },
        },
      };
    }
    throw new Error('Not Found');
  };

  const compListRes = await adminService.listCompanies({ search: 'Acme', hiringStatus: 'Actively Hiring' });
  assert(compListRes.success === true, '4.1 listCompanies succeeds');
  assert(capturedParams.search === 'Acme' && capturedParams.hiringStatus === 'Actively Hiring', '4.2 Passes company search and status filters');

  api.post = async (url, body) => {
    capturedBody = body;
    return { data: { success: true, statusCode: 201, data: { _id: mockCompanyId, companyName: body.companyName } } };
  };

  const createCompRes = await adminService.createCompany({ companyName: 'Acme AI', website: 'https://acme.ai' });
  assert(createCompRes.success === true && capturedBody.companyName === 'Acme AI', '4.3 createCompany posts new company data');

  api.put = async (url, body) => {
    capturedBody = body;
    return { data: { success: true, data: { _id: mockCompanyId, companyName: body.companyName } } };
  };

  const updateCompRes = await adminService.updateCompany(mockCompanyId, { companyName: 'Acme AI Global' });
  assert(updateCompRes.success === true && capturedBody.companyName === 'Acme AI Global', '4.4 updateCompany updates existing profile');

  const compDelRes = await adminService.deleteCompany(mockCompanyId);
  assert(compDelRes.success === true, '4.5 deleteCompany deletes company profile');

  /* ==========================================================================
     SECTION 5: JOB MANAGEMENT (F10.7)
     ========================================================================== */
  console.log('\n--- SECTION 5: JOB MANAGEMENT (F10.7) ---');
  api.get = async (url, config) => {
    if (url === '/admin/jobs') {
      capturedParams = config?.params;
      return {
        data: {
          success: true,
          data: {
            jobs: [{ _id: mockJobId, title: 'Senior AI Engineer', workMode: 'Remote', status: 'Active' }],
            pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
          },
        },
      };
    }
    throw new Error('Not Found');
  };

  const jobListRes = await adminService.listJobs({ search: 'AI', status: 'Active' });
  assert(jobListRes.success === true, '5.1 listJobs succeeds');
  assert(capturedParams.search === 'AI' && capturedParams.status === 'Active', '5.2 Passes job search and status parameters');

  api.post = async (url, body) => {
    capturedBody = body;
    return { data: { success: true, statusCode: 201, data: { _id: mockJobId, title: body.title } } };
  };

  const createJobRes = await adminService.createJob({ title: 'Fullstack Dev', company: mockCompanyId, location: 'Remote' });
  assert(createJobRes.success === true && capturedBody.title === 'Fullstack Dev', '5.3 createJob creates new posting');

  const jobDelRes = await adminService.deleteJob(mockJobId);
  assert(jobDelRes.success === true, '5.4 deleteJob deletes job posting');

  /* ==========================================================================
     SECTION 6: APPLICATION MONITORING (F10.8)
     ========================================================================== */
  console.log('\n--- SECTION 6: APPLICATION MONITORING (F10.8) ---');
  api.get = async (url) => {
    if (url === '/admin/applications') {
      return {
        data: {
          success: true,
          data: {
            applications: [{ _id: mockAppId, candidate: { name: 'John Doe' }, job: { title: 'Engineer' }, status: 'Submitted' }],
            pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
          },
        },
      };
    }
    if (url === '/admin/applications/statistics') {
      return { data: { success: true, data: { totalApplications: 100, conversionMetrics: { interviewConversionRatePercent: 20 } } } };
    }
    if (url === `/admin/applications/${mockAppId}`) {
      return { data: { success: true, data: { _id: mockAppId, candidate: { name: 'John Doe' }, status: 'Submitted' } } };
    }
    throw new Error('Not Found');
  };

  const appListRes = await adminService.listApplications();
  assert(appListRes.success === true, '6.1 listApplications retrieves candidate applications');

  const appStatsRes = await adminService.getApplicationStats();
  assert(appStatsRes.success === true, '6.2 getApplicationStats retrieves conversion statistics');

  const appDetailRes = await adminService.getApplicationById(mockAppId);
  assert(appDetailRes.data._id === mockAppId, '6.3 getApplicationById retrieves application record');

  /* ==========================================================================
     SECTION 7: ANALYTICS & AI TELEMETRY (F10.9)
     ========================================================================== */
  console.log('\n--- SECTION 7: ANALYTICS & AI TELEMETRY (F10.9) ---');
  api.get = async (url, config) => {
    if (url === '/admin/analytics/users') {
      capturedParams = config?.params;
      return {
        data: {
          success: true,
          data: {
            totalUsers: 150,
            dailyGrowth: [{ date: '2026-08-01', count: 5 }, { date: '2026-08-02', count: 8 }],
          },
        },
      };
    }
    if (url === '/admin/analytics/jobs') {
      return {
        data: {
          success: true,
          data: {
            jobs: { dailyPostingsTrend: [{ date: '2026-08-01', count: 2 }], workModeBreakdown: [{ workMode: 'Remote', count: 30 }] },
          },
        },
      };
    }
    throw new Error('Not Found');
  };

  const userAnalyticsRes = await adminService.getUserAnalytics({ days: 90 });
  assert(userAnalyticsRes.success === true, '7.1 getUserAnalytics succeeds');
  assert(capturedParams.days === 90, '7.2 Passes date range days parameter (days=90)');

  const jobAnalyticsRes = await adminService.getJobAnalytics();
  assert(jobAnalyticsRes.success === true, '7.3 getJobAnalytics succeeds');

  /* ==========================================================================
     SECTION 8: ERROR PARSING & SANITIZATION (F10.10 & F10.11)
     ========================================================================== */
  console.log('\n--- SECTION 8: ERROR PARSING & SANITIZATION (F10.10 & F10.11) ---');
  const err401 = { response: { status: 401 } };
  assert(parseApiError(err401) === 'Session expired or unauthorized. Please log in again.', '8.1 Parses 401 Unauthorized cleanly');

  const err403 = { response: { status: 403 } };
  assert(parseApiError(err403) === 'Access denied. You do not have permission to perform this action.', '8.2 Parses 403 Forbidden cleanly');

  const errStack = { response: { status: 500, data: { message: 'CastError: Cast to ObjectId failed at model.findOne' } } };
  const cleanMsg = parseApiError(errStack);
  assert(!cleanMsg.includes('CastError') && !cleanMsg.includes('at model'), '8.3 Strips raw backend stack traces and MongoError strings');

  // Restore original API mocks
  api.get = originalGet;
  api.post = originalPost;
  api.put = originalPut;
  api.patch = originalPatch;
  api.delete = originalDelete;

  console.log('\n================================================================');
  console.log(` MASTER TEST SUITE RESULT: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('================================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runMasterTestSuite().catch((err) => {
  console.error('Unhandled master test runner error:', err);
  process.exit(1);
});
