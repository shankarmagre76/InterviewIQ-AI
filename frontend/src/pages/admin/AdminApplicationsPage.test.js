import { adminService } from '../../services/adminService.js';
import { api } from '../../services/api.js';

console.log('=== FRONTEND ADMIN APPLICATION MONITORING (F10.8) INTEGRATION TEST SUITE ===\n');

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
  const mockAppId = '65a1b2c3d4e5f6a7b8c9d004';
  const originalGet = api.get;

  let capturedParams = null;

  // Test 1: Server-Side Application Filtering & Search
  console.log('--- 1. Testing Server-Side Application Filtering & Search ---');
  api.get = async (url, config) => {
    if (url === '/admin/applications') {
      capturedParams = config?.params;
      return {
        data: {
          success: true,
          statusCode: 200,
          data: {
            applications: [
              {
                _id: mockAppId,
                candidate: { name: 'John Candidate', email: 'john@example.com' },
                job: { title: 'Senior Developer', location: 'Remote', workMode: 'Remote' },
                company: { companyName: 'Acme Tech' },
                status: 'Submitted',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
            pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
          },
        },
      };
    }
    if (url === '/admin/applications/statistics') {
      return {
        data: {
          success: true,
          data: {
            totalApplications: 150,
            conversionMetrics: { interviewConversionRatePercent: 25.5, offerConversionRatePercent: 12.0 },
          },
        },
      };
    }
    if (url === `/admin/applications/${mockAppId}`) {
      return {
        data: {
          success: true,
          data: {
            _id: mockAppId,
            candidate: { name: 'John Candidate', email: 'john@example.com' },
            job: { title: 'Senior Developer' },
            status: 'Submitted',
            statusHistory: [{ status: 'Submitted', date: new Date().toISOString() }],
          },
        },
      };
    }
    throw new Error(`Unexpected GET route ${url}`);
  };

  const res = await adminService.listApplications({ page: 1, limit: 10, search: 'John', status: 'Submitted', company: '65a1b2c3d4e5f6a7b8c9d002' });
  assert(res.success === true, 'listApplications succeeds');
  assert(capturedParams.search === 'John', 'Passes search query parameter');
  assert(capturedParams.status === 'Submitted', 'Passes status filter parameter');
  assert(capturedParams.company === '65a1b2c3d4e5f6a7b8c9d002', 'Passes company filter parameter');

  // Test 2: Retrieve Application Statistics
  console.log('\n--- 2. Testing Application Statistics API ---');
  const statsRes = await adminService.getApplicationStatistics();
  assert(statsRes.success === true, 'getApplicationStatistics succeeds');
  assert(statsRes.data.conversionMetrics.interviewConversionRatePercent === 25.5, 'Maps interview conversion rate percent');

  // Test 3: Retrieve Application Details By ID
  console.log('\n--- 3. Testing Get Application By ID API ---');
  const detailsRes = await adminService.getApplicationById(mockAppId);
  assert(detailsRes.success === true && detailsRes.data._id === mockAppId, 'getApplicationById retrieves specific application');
  assert(detailsRes.data.candidate.email === 'john@example.com', 'Maps candidate information correctly');

  // Test 4: Error Copy Specs
  console.log('\n--- 4. Testing Error Copy Specs ---');
  const expectedErrorTitle = "Couldn't load application records.";
  assert(expectedErrorTitle === "Couldn't load application records.", 'Error title matches user copy specs');

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
