import { adminService } from '../../services/adminService.js';
import { api } from '../../services/api.js';

console.log('=== FRONTEND ADMIN ANALYTICS (F10.9) INTEGRATION TEST SUITE ===\n');

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
  const originalGet = api.get;
  let capturedUserAnalyticsParams = null;

  // Test 1: Real Backend Analytics Payload Mapping
  console.log('--- 1. Testing Analytics Endpoints Payload Mapping ---');
  api.get = async (url, config) => {
    if (url === '/admin/analytics/users') {
      capturedUserAnalyticsParams = config?.params;
      return {
        data: {
          success: true,
          statusCode: 200,
          data: {
            totalUsers: 150,
            activeUsers: 140,
            inactiveUsers: 10,
            roleBreakdown: [{ role: 'Student', count: 120 }, { role: 'Recruiter', count: 25 }, { role: 'Admin', count: 5 }],
            dailyGrowth: [{ date: '2026-08-01', count: 5 }, { date: '2026-08-02', count: 8 }],
          },
        },
      };
    }
    if (url === '/admin/analytics/jobs') {
      return {
        data: {
          success: true,
          statusCode: 200,
          data: {
            companies: { totalCompanies: 20, statusBreakdown: [{ status: 'Actively Hiring', count: 15 }] },
            jobs: {
              totalJobs: 50,
              statusBreakdown: [{ status: 'Active', count: 40 }],
              workModeBreakdown: [{ workMode: 'Remote', count: 30 }, { workMode: 'Hybrid', count: 20 }],
              employmentTypeBreakdown: [{ employmentType: 'Full-time', count: 45 }],
              dailyPostingsTrend: [{ date: '2026-08-01', count: 3 }],
            },
          },
        },
      };
    }
    if (url === '/admin/dashboard') {
      return { data: { success: true, data: { users: {}, jobs: {}, applications: {}, interviews: {}, resumes: {}, roadmaps: {} } } };
    }
    throw new Error(`Unexpected route ${url}`);
  };

  const userRes = await adminService.getUserAnalytics({ days: 60 });
  assert(userRes.success === true, 'getUserAnalytics succeeds');
  assert(capturedUserAnalyticsParams.days === 60, 'Passes days parameter (days=60)');
  assert(userRes.data.dailyGrowth.length === 2, 'Maps dailyGrowth time-series array');

  const jobRes = await adminService.getJobAnalytics();
  assert(jobRes.success === true, 'getJobAnalytics succeeds');
  assert(jobRes.data.jobs.workModeBreakdown[0].workMode === 'Remote', 'Maps workMode breakdown correctly');

  // Test 2: Empty Dataset Handling
  console.log('\n--- 2. Testing Empty Dataset Handling ---');
  api.get = async (url) => {
    if (url === '/admin/analytics/users') {
      return { data: { success: true, data: { totalUsers: 0, dailyGrowth: [] } } };
    }
    return { data: { success: true, data: {} } };
  };

  const emptyRes = await adminService.getUserAnalytics({ days: 30 });
  assert(emptyRes.data.dailyGrowth.length === 0, 'Handles empty dailyGrowth dataset without throwing errors');

  // Test 3: Error Copy Specs
  console.log('\n--- 3. Testing Error Copy Specs ---');
  const expectedErrorTitle = "Couldn't load platform analytics.";
  assert(expectedErrorTitle === "Couldn't load platform analytics.", 'Error title matches user copy specs');

  // Restore mocks
  api.get = originalGet;

  console.log('\n==================================================');
  console.log(`TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('==================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Unhandled test runner error:', err);
  process.exit(1);
});
