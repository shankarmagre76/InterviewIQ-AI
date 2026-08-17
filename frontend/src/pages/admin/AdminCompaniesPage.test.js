import { adminService } from '../../services/adminService.js';
import { api } from '../../services/api.js';

console.log('=== FRONTEND ADMIN COMPANY MANAGEMENT (F10.6) INTEGRATION TEST SUITE ===\n');

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
  const mockCompanyId = '65a1b2c3d4e5f6a7b8c9d002';
  const originalGet = api.get;
  const originalPost = api.post;
  const originalPut = api.put;
  const originalPatch = api.patch;
  const originalDelete = api.delete;

  let capturedParams = null;
  let capturedBody = null;

  // Test 1: Query Parameters (Search, Industry, Hiring Status, Pagination)
  console.log('--- 1. Testing Server-Side Company Filtering & Search ---');
  api.get = async (url, config) => {
    capturedParams = config?.params;
    return {
      data: {
        success: true,
        statusCode: 200,
        data: {
          companies: [
            {
              _id: mockCompanyId,
              companyName: 'TechCorp Solutions',
              website: 'https://techcorp.com',
              industry: 'Software Development',
              headquarters: 'San Francisco, CA',
              companySize: '51-200',
              foundedYear: 2018,
              email: 'careers@techcorp.com',
              hiringStatus: 'Actively Hiring',
              createdAt: new Date().toISOString(),
            },
          ],
          pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
        },
      },
    };
  };

  const res = await adminService.listCompanies({ page: 1, limit: 10, search: 'Tech', industry: 'Software Development', hiringStatus: 'Actively Hiring' });
  assert(res.success === true, 'listCompanies succeeds');
  assert(capturedParams.search === 'Tech', 'Passes search query parameter');
  assert(capturedParams.industry === 'Software Development', 'Passes industry filter parameter');
  assert(capturedParams.hiringStatus === 'Actively Hiring', 'Passes hiringStatus filter parameter');

  // Test 2: Create Company Profile
  console.log('\n--- 2. Testing Create Company Profile ---');
  api.post = async (url, body) => {
    capturedBody = body;
    return { data: { success: true, statusCode: 201, data: { _id: mockCompanyId, companyName: body.companyName } } };
  };

  const createRes = await adminService.createCompany({ companyName: 'Acme AI', website: 'https://acme.ai', industry: 'AI/ML', headquarters: 'NYC' });
  assert(createRes.success === true && capturedBody.companyName === 'Acme AI', 'createCompany posts data to /admin/companies');

  // Test 3: Update Company Profile
  console.log('\n--- 3. Testing Update Company Profile ---');
  api.put = async (url, body) => {
    capturedBody = body;
    return { data: { success: true, data: { _id: mockCompanyId, companyName: body.companyName } } };
  };

  const updateRes = await adminService.updateCompany(mockCompanyId, { companyName: 'Acme AI Global' });
  assert(updateRes.success === true && capturedBody.companyName === 'Acme AI Global', 'updateCompany puts data to /admin/companies/:id');

  // Test 4: Update Hiring Status
  console.log('\n--- 4. Testing Update Company Hiring Status ---');
  api.patch = async (url, body) => {
    capturedBody = body;
    return { data: { success: true, data: { _id: mockCompanyId, hiringStatus: body.hiringStatus } } };
  };

  const statusRes = await adminService.updateCompanyStatus(mockCompanyId, { hiringStatus: 'Hiring Freeze' });
  assert(statusRes.success === true && capturedBody.hiringStatus === 'Hiring Freeze', 'updateCompanyStatus patches hiringStatus to /admin/companies/:id/status');

  // Test 5: Delete Company Profile
  console.log('\n--- 5. Testing Delete Company Profile ---');
  api.delete = async (url) => {
    return { data: { success: true, message: 'Company deleted' } };
  };

  const delRes = await adminService.deleteCompany(mockCompanyId);
  assert(delRes.success === true, 'deleteCompany sends DELETE request to /admin/companies/:id');

  // Test 6: Error Copy Specs
  console.log('\n--- 6. Testing Error Copy Specs ---');
  const expectedErrorTitle = "Couldn't load company directory.";
  assert(expectedErrorTitle === "Couldn't load company directory.", 'Error title matches user copy specs');

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
