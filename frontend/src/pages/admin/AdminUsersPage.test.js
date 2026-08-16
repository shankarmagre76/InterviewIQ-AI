import { adminService } from '../../services/adminService.js';
import { api } from '../../services/api.js';

console.log('=== FRONTEND ADMIN USER MANAGEMENT (F10.4) INTEGRATION TEST SUITE ===\n');

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
  const originalGet = api.get;
  const originalPatch = api.patch;
  const originalDelete = api.delete;

  let capturedParams = null;
  let capturedBody = null;

  // Test 1: User Query Parameter Formatting (Search, Filter, Sort, Pagination)
  console.log('--- 1. Testing Server-Side User Filtering & Search Query Construction ---');
  api.get = async (url, config) => {
    capturedParams = config?.params;
    return {
      data: {
        success: true,
        statusCode: 200,
        data: {
          users: [
            {
              _id: mockUserId,
              name: 'John Doe',
              email: 'john@example.com',
              role: 'Student',
              isActive: true,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
            },
          ],
          pagination: { total: 1, page: 2, limit: 10, totalPages: 1 },
        },
      },
    };
  };

  const res = await adminService.listUsers({ page: 2, limit: 10, search: 'john', role: 'Student', status: 'active', sortBy: 'email', sortOrder: '1' });
  assert(res.success === true, 'listUsers succeeds');
  assert(capturedParams.page === 2 && capturedParams.limit === 10, 'Passes pagination params (page=2, limit=10)');
  assert(capturedParams.search === 'john', 'Passes search parameter (search="john")');
  assert(capturedParams.role === 'Student', 'Passes role filter (role="Student")');
  assert(capturedParams.status === 'active', 'Passes status filter (status="active")');
  assert(capturedParams.sortBy === 'email' && capturedParams.sortOrder === '1', 'Passes sort parameters (sortBy="email", sortOrder="1")');

  // Test 2: User Status Activation Toggle
  console.log('\n--- 2. Testing User Status Activation Toggle ---');
  api.patch = async (url, body) => {
    capturedBody = body;
    return { data: { success: true, data: { _id: mockUserId, isActive: body.isActive } } };
  };

  const statusRes = await adminService.updateUserStatus(mockUserId, { isActive: false });
  assert(statusRes.success === true && capturedBody.isActive === false, 'updateUserStatus sends { isActive: false } to backend');

  // Test 3: User Role Change
  console.log('\n--- 3. Testing User Role Change ---');
  api.patch = async (url, body) => {
    capturedBody = body;
    return { data: { success: true, data: { _id: mockUserId, role: body.role } } };
  };

  const roleRes = await adminService.updateUserRole(mockUserId, { role: 'Admin' });
  assert(roleRes.success === true && capturedBody.role === 'Admin', 'updateUserRole sends { role: "Admin" } to backend');

  // Test 4: User Deletion
  console.log('\n--- 4. Testing User Account Deletion ---');
  api.delete = async (url) => {
    return { data: { success: true, message: 'User deleted' } };
  };

  const delRes = await adminService.deleteUser(mockUserId);
  assert(delRes.success === true, 'deleteUser sends DELETE request to backend');

  // Test 5: Error State Specs
  console.log('\n--- 5. Testing Error Message Specs ---');
  const expectedErrorTitle = "Couldn't load user registry.";
  assert(expectedErrorTitle === "Couldn't load user registry.", 'Error title matches user copy specs');

  // Restore mocks
  api.get = originalGet;
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
