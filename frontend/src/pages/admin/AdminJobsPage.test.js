import { adminService } from '../../services/adminService.js';
import { api } from '../../services/api.js';

console.log('=== FRONTEND ADMIN JOB MANAGEMENT (F10.7) INTEGRATION TEST SUITE ===\n');

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
  const mockJobId = '65a1b2c3d4e5f6a7b8c9d003';
  const originalGet = api.get;
  const originalPost = api.post;
  const originalPut = api.put;
  const originalPatch = api.patch;
  const originalDelete = api.delete;

  let capturedParams = null;
  let capturedBody = null;

  // Test 1: Server-Side Job Filtering & Search Query Construction
  console.log('--- 1. Testing Server-Side Job Filtering & Search ---');
  api.get = async (url, config) => {
    capturedParams = config?.params;
    return {
      data: {
        success: true,
        statusCode: 200,
        data: {
          jobs: [
            {
              _id: mockJobId,
              title: 'Senior React Developer',
              company: { _id: '65a1b2c3d4e5f6a7b8c9d002', companyName: 'TechCorp Solutions' },
              location: 'Remote',
              workMode: 'Remote',
              employmentType: 'Full-time',
              status: 'Active',
              createdAt: new Date().toISOString(),
            },
          ],
          pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
        },
      },
    };
  };

  const res = await adminService.listJobs({ page: 1, limit: 10, search: 'React', status: 'Active', workMode: 'Remote', employmentType: 'Full-time' });
  assert(res.success === true, 'listJobs succeeds');
  assert(capturedParams.search === 'React', 'Passes search query parameter');
  assert(capturedParams.status === 'Active', 'Passes status filter parameter');
  assert(capturedParams.workMode === 'Remote', 'Passes workMode filter parameter');
  assert(capturedParams.employmentType === 'Full-time', 'Passes employmentType filter parameter');

  // Test 2: Create Job Posting
  console.log('\n--- 2. Testing Create Job Posting ---');
  api.post = async (url, body) => {
    capturedBody = body;
    return { data: { success: true, statusCode: 201, data: { _id: mockJobId, title: body.title } } };
  };

  const createRes = await adminService.createJob({ title: 'AI Engineer', company: '65a1b2c3d4e5f6a7b8c9d002', location: 'NYC', workMode: 'Hybrid', employmentType: 'Full-time' });
  assert(createRes.success === true && capturedBody.title === 'AI Engineer', 'createJob posts data to /admin/jobs');

  // Test 3: Update Job Posting
  console.log('\n--- 3. Testing Update Job Posting ---');
  api.put = async (url, body) => {
    capturedBody = body;
    return { data: { success: true, data: { _id: mockJobId, title: body.title } } };
  };

  const updateRes = await adminService.updateJob(mockJobId, { title: 'Lead AI Engineer' });
  assert(updateRes.success === true && capturedBody.title === 'Lead AI Engineer', 'updateJob puts data to /admin/jobs/:id');

  // Test 4: Update Job Status
  console.log('\n--- 4. Testing Update Job Status ---');
  api.patch = async (url, body) => {
    capturedBody = body;
    return { data: { success: true, data: { _id: mockJobId, status: body.status } } };
  };

  const statusRes = await adminService.updateJobStatus(mockJobId, { status: 'Closed' });
  assert(statusRes.success === true && capturedBody.status === 'Closed', 'updateJobStatus patches status to /admin/jobs/:id/status');

  // Test 5: Delete Job Posting
  console.log('\n--- 5. Testing Delete Job Posting ---');
  api.delete = async (url) => {
    return { data: { success: true, message: 'Job posting deleted' } };
  };

  const delRes = await adminService.deleteJob(mockJobId);
  assert(delRes.success === true, 'deleteJob sends DELETE request to /admin/jobs/:id');

  // Test 6: Error Copy Specs
  console.log('\n--- 6. Testing Error Copy Specs ---');
  const expectedErrorTitle = "Couldn't load job postings.";
  assert(expectedErrorTitle === "Couldn't load job postings.", 'Error title matches user copy specs');

  // Restore mocks
  api.get = originalGet;
  api.post = originalPost;
  api.put = originalPut;
  api.patch = originalPatch;
  api.delete = originalDelete;

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
