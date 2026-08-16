import { adminService } from '../../services/adminService.js';
import { api } from '../../services/api.js';

console.log('=== FRONTEND ADMIN USER DETAILS & ACTIONS (F10.5) TEST SUITE ===\n');

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

  let capturedBody = null;

  // Test 1: Fetch User Details Payload
  console.log('--- 1. Testing GET /admin/users/:id Payload Mapping ---');
  api.get = async (url) => {
    if (url === `/admin/users/${mockUserId}`) {
      return {
        data: {
          success: true,
          statusCode: 200,
          data: {
            _id: mockUserId,
            name: 'Alice Johnson',
            email: 'alice@example.com',
            role: 'Student',
            isActive: true,
            isEmailVerified: true,
            createdAt: '2026-01-15T10:00:00.000Z',
            lastLogin: '2026-08-16T12:00:00.000Z',
          },
        },
      };
    }
    throw new Error('Not Found');
  };

  const res = await adminService.getUserById(mockUserId);
  assert(res.success === true && res.data._id === mockUserId, 'getUserById retrieves user details payload');
  assert(res.data.email === 'alice@example.com', 'Maps user email correctly');
  assert(res.data.isEmailVerified === true, 'Maps email verification status');

  // Test 2: Account Activation / Deactivation Mutation
  console.log('\n--- 2. Testing Account Status Mutation ---');
  api.patch = async (url, body) => {
    capturedBody = body;
    return { data: { success: true, data: { _id: mockUserId, isActive: body.isActive } } };
  };

  const statusRes = await adminService.updateUserStatus(mockUserId, { isActive: false });
  assert(statusRes.success === true && capturedBody.isActive === false, 'updateUserStatus sends { isActive: false } to backend');

  // Test 3: Role Change Mutation
  console.log('\n--- 3. Testing Role Change Mutation ---');
  api.patch = async (url, body) => {
    capturedBody = body;
    return { data: { success: true, data: { _id: mockUserId, role: body.role } } };
  };

  const roleRes = await adminService.updateUserRole(mockUserId, { role: 'Admin' });
  assert(roleRes.success === true && capturedBody.role === 'Admin', 'updateUserRole sends { role: "Admin" } to backend');

  // Test 4: Account Deletion Mutation
  console.log('\n--- 4. Testing Account Deletion Mutation ---');
  api.delete = async (url) => {
    return { data: { success: true, message: 'User account deleted successfully' } };
  };

  const delRes = await adminService.deleteUser(mockUserId);
  assert(delRes.success === true, 'deleteUser sends DELETE request to backend');

  // Test 5: HTTP Error Status Handling (403 Forbidden & 404 Not Found)
  console.log('\n--- 5. Testing HTTP 403 / 404 Error Status Handling ---');
  api.get = async () => {
    const err = new Error('HTTP 404 Not Found');
    err.response = { status: 404, data: { message: 'User not found' } };
    throw err;
  };

  let notFoundCaught = false;
  try {
    await adminService.getUserById('invalid-id');
  } catch (e) {
    notFoundCaught = e.response.status === 404;
  }
  assert(notFoundCaught, 'Catches 404 Not Found error for invalid/deleted user IDs');

  api.get = async () => {
    const err = new Error('HTTP 403 Forbidden');
    err.response = { status: 403, data: { message: 'Admin access required' } };
    throw err;
  };

  let forbiddenCaught = false;
  try {
    await adminService.getUserById(mockUserId);
  } catch (e) {
    forbiddenCaught = e.response.status === 403;
  }
  assert(forbiddenCaught, 'Catches 403 Forbidden error when non-admin accesses endpoint');

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
