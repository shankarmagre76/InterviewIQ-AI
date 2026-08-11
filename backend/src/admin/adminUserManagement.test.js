import express from 'express';
import mongoose from 'mongoose';
import routes from '../routes/index.js';
import errorHandler from '../middleware/error.middleware.js';
import { generateAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';

console.log('=================================================================');
console.log('  INTERVIEWIQ AI - PHASE 10.2 ADMIN USER MANAGEMENT TEST SUITE');
console.log('=================================================================\n');

async function runAdminUserManagementTestSuite() {
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
    const recruiterId = new mongoose.Types.ObjectId().toString();

    const adminToken = `Bearer ${generateAccessToken({ id: adminId })}`;
    const studentToken = `Bearer ${generateAccessToken({ id: studentId })}`;
    const recruiterToken = `Bearer ${generateAccessToken({ id: recruiterId })}`;

    // In-memory mock database for User model
    let mockUsers = [
      {
        _id: adminId,
        firstName: 'System',
        lastName: 'Admin',
        email: 'admin@interviewiq.ai',
        role: 'Admin',
        isActive: true,
        password: 'hashedpassword123',
        refreshToken: 'refreshtoken123',
        createdAt: new Date('2026-01-01'),
      },
      {
        _id: studentId,
        firstName: 'Alice',
        lastName: 'Student',
        email: 'alice@example.com',
        role: 'Student',
        isActive: true,
        password: 'hashedpassword123',
        createdAt: new Date('2026-01-02'),
      },
      {
        _id: recruiterId,
        firstName: 'Bob',
        lastName: 'Recruiter',
        email: 'bob@techcorp.com',
        role: 'Recruiter',
        isActive: true,
        password: 'hashedpassword123',
        createdAt: new Date('2026-01-03'),
      },
    ];

    // Stub User model Mongoose methods
    const origUserFindById = User.findById;
    const origUserFind = User.find;
    const origUserCountDocuments = User.countDocuments;
    const origUserFindByIdAndUpdate = User.findByIdAndUpdate;
    const origUserFindByIdAndDelete = User.findByIdAndDelete;

    User.findById = (id) => {
      const idStr = String(id);
      const user = mockUsers.find((u) => String(u._id) === idStr) || null;
      return {
        select: () => ({
          lean: async () => (user ? { ...user, password: undefined, refreshToken: undefined } : null),
          then: (resolve) => resolve(user ? { ...user, password: undefined, refreshToken: undefined } : null),
        }),
        then: (resolve) => resolve(user),
      };
    };

    User.find = (filter = {}) => {
      let filtered = [...mockUsers];
      if (filter.role) {
        filtered = filtered.filter((u) => u.role === filter.role);
      }
      if (filter.isActive !== undefined) {
        filtered = filtered.filter((u) => u.isActive === filter.isActive);
      }
      if (filter.$or) {
        filtered = filtered.filter((u) => {
          return filter.$or.some((clause) => {
            if (clause.firstName && clause.firstName.test(u.firstName)) return true;
            if (clause.lastName && clause.lastName.test(u.lastName)) return true;
            if (clause.email && clause.email.test(u.email)) return true;
            return false;
          });
        });
      }

      return {
        select: () => ({
          sort: (sortObj = {}) => ({
            skip: (skipVal = 0) => ({
              limit: (limitVal = 10) => ({
                lean: async () =>
                  filtered.slice(skipVal, skipVal + limitVal).map((u) => {
                    const copy = { ...u };
                    delete copy.password;
                    delete copy.refreshToken;
                    return copy;
                  }),
              }),
            }),
          }),
        }),
      };
    };

    User.countDocuments = async (filter = {}) => {
      let filtered = [...mockUsers];
      if (filter.role) filtered = filtered.filter((u) => u.role === filter.role);
      if (filter.isActive !== undefined) filtered = filtered.filter((u) => u.isActive === filter.isActive);
      return filtered.length;
    };

    User.findByIdAndUpdate = (id, update) => {
      const idStr = String(id);
      const user = mockUsers.find((u) => String(u._id) === idStr);
      if (user) Object.assign(user, update);
      return {
        select: () => {
          const copy = user ? { ...user } : null;
          if (copy) {
            delete copy.password;
            delete copy.refreshToken;
          }
          return Promise.resolve(copy);
        },
      };
    };

    User.findByIdAndDelete = async (id) => {
      const idStr = String(id);
      const idx = mockUsers.findIndex((u) => String(u._id) === idStr);
      if (idx !== -1) {
        return mockUsers.splice(idx, 1)[0];
      }
      return null;
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
    // EXECUTE ADMIN USER MANAGEMENT TEST SCENARIOS
    // =========================================================================

    // 1. List Users (GET /api/v1/admin/users)
    const listRes = await makeRequest('/api/v1/admin/users?page=1&limit=10', 'GET');
    assert(
      listRes.status === 200 &&
        listRes.data.success === true &&
        Array.isArray(listRes.data.data) &&
        listRes.data.meta.total === 3,
      'Test 1: Admin can list all users with pagination metadata',
      `Total: ${listRes.data.meta?.total}`
    );

    // 2. Search Users by Keyword
    const searchRes = await makeRequest('/api/v1/admin/users?search=alice', 'GET');
    assert(
      searchRes.status === 200 && searchRes.data.data.length === 1 && searchRes.data.data[0].email === 'alice@example.com',
      'Test 2: Admin can search users by keyword name/email',
      `Found: ${searchRes.data.data?.[0]?.email}`
    );

    // 3. Filter Users by Role
    const roleFilterRes = await makeRequest('/api/v1/admin/users?role=Recruiter', 'GET');
    assert(
      roleFilterRes.status === 200 && roleFilterRes.data.data.length === 1 && roleFilterRes.data.data[0].role === 'Recruiter',
      'Test 3: Admin can filter users by role (Recruiter)',
      `Role: ${roleFilterRes.data.data?.[0]?.role}`
    );

    // 4. View User Details (GET /api/v1/admin/users/:id)
    const detailRes = await makeRequest(`/api/v1/admin/users/${studentId}`, 'GET');
    assert(
      detailRes.status === 200 &&
        detailRes.data.data.email === 'alice@example.com' &&
        detailRes.data.data.password === undefined,
      'Test 4: Admin can view user details with password/sensitive fields stripped',
      `Email: ${detailRes.data.data?.email}`
    );

    // 5. Deactivate User Account (PATCH /api/v1/admin/users/:id/status)
    const deactivateRes = await makeRequest(`/api/v1/admin/users/${studentId}/status`, 'PATCH', { isActive: false });
    assert(
      deactivateRes.status === 200 && deactivateRes.data.data.isActive === false,
      'Test 5: Admin can deactivate a student account',
      `isActive: ${deactivateRes.data.data?.isActive}`
    );

    // 6. Reactivate User Account (PATCH /api/v1/admin/users/:id/status)
    const activateRes = await makeRequest(`/api/v1/admin/users/${studentId}/status`, 'PATCH', { isActive: true });
    assert(
      activateRes.status === 200 && activateRes.data.data.isActive === true,
      'Test 6: Admin can reactivate a student account',
      `isActive: ${activateRes.data.data?.isActive}`
    );

    // 7. Change User Role (PATCH /api/v1/admin/users/:id/role)
    const changeRoleRes = await makeRequest(`/api/v1/admin/users/${studentId}/role`, 'PATCH', { role: 'Recruiter' });
    assert(
      changeRoleRes.status === 200 && changeRoleRes.data.data.role === 'Recruiter',
      'Test 7: Admin can promote/change user role to Recruiter',
      `New Role: ${changeRoleRes.data.data?.role}`
    );

    // 8. Self-Protection Guard 1: Admin Self-Deactivation Attempt
    const selfDeactivateRes = await makeRequest(`/api/v1/admin/users/${adminId}/status`, 'PATCH', { isActive: false });
    assert(
      selfDeactivateRes.status === 400 && selfDeactivateRes.data.message.includes('Admin cannot deactivate their own account'),
      'Test 8: Self-Protection Guard prevents Admin self-deactivation (400 Bad Request)',
      `Message: ${selfDeactivateRes.data.message}`
    );

    // 9. Self-Protection Guard 2: Admin Self-Role Revocation Attempt
    const selfRoleRes = await makeRequest(`/api/v1/admin/users/${adminId}/role`, 'PATCH', { role: 'Student' });
    assert(
      selfRoleRes.status === 400 && selfRoleRes.data.message.includes('Admin cannot revoke their own admin role'),
      'Test 9: Self-Protection Guard prevents Admin self-demotion (400 Bad Request)',
      `Message: ${selfRoleRes.data.message}`
    );

    // 10. Self-Protection Guard 3: Admin Self-Deletion Attempt
    const selfDeleteRes = await makeRequest(`/api/v1/admin/users/${adminId}`, 'DELETE');
    assert(
      selfDeleteRes.status === 400 && selfDeleteRes.data.message.includes('Admin cannot delete their own account'),
      'Test 10: Self-Protection Guard prevents Admin self-deletion (400 Bad Request)',
      `Message: ${selfDeleteRes.data.message}`
    );

    // 11. Input Validation 1: Invalid Role Value
    const invalidRoleRes = await makeRequest(`/api/v1/admin/users/${recruiterId}/role`, 'PATCH', { role: 'SuperBoss' });
    assert(
      invalidRoleRes.status === 400,
      'Test 11: Validation rejects invalid role string with 400 Bad Request',
      `Status: ${invalidRoleRes.status}`
    );

    // 12. Input Validation 2: Invalid Mongo User ID
    const invalidIdRes = await makeRequest('/api/v1/admin/users/not-a-mongo-id', 'GET');
    assert(
      invalidIdRes.status === 400,
      'Test 12: Validation rejects invalid MongoDB user ID format with 400 Bad Request',
      `Status: ${invalidIdRes.status}`
    );

    // 13. Authorization: Non-Admin Access (Recruiter token)
    const forbiddenRes = await makeRequest('/api/v1/admin/users', 'GET', null, recruiterToken);
    assert(
      forbiddenRes.status === 403,
      'Test 13: Non-admin normal user (Recruiter) is rejected with 403 Forbidden',
      `Status: ${forbiddenRes.status}`
    );

    // 14. Authentication: Unauthenticated Access (No JWT)
    const unauthRes = await makeRequest('/api/v1/admin/users', 'GET', null, null);
    assert(
      unauthRes.status === 401,
      'Test 14: Unauthenticated request without token is rejected with 401 Unauthorized',
      `Status: ${unauthRes.status}`
    );

    // 15. Delete User Account (DELETE /api/v1/admin/users/:id)
    const deleteRes = await makeRequest(`/api/v1/admin/users/${studentId}`, 'DELETE');
    assert(
      deleteRes.status === 200 && deleteRes.data.data.deletedUserId === studentId,
      'Test 15: Admin can delete a user account',
      `Deleted ID: ${deleteRes.data.data?.deletedUserId}`
    );

    // Cleanup & Teardown
    server.close();
    User.findById = origUserFindById;
    User.find = origUserFind;
    User.countDocuments = origUserCountDocuments;
    User.findByIdAndUpdate = origUserFindByIdAndUpdate;
    User.findByIdAndDelete = origUserFindByIdAndDelete;

  } catch (err) {
    assert(false, 'Unexpected execution exception in Admin User Management Suite', err.stack);
  }

  console.log('\n=================================================================');
  console.log(` SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} Tests`);
  console.log('=================================================================\n');

  return { passedCount, failedCount };
}

runAdminUserManagementTestSuite();
