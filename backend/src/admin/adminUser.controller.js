import asyncHandler from '../middleware/async.middleware.js';
import ApiResponse from '../utils/ApiResponse.js';
import adminUserService from './adminUser.service.js';

/**
 * Admin User Controller Layer
 * Handles HTTP requests, extracts parameters, delegates to AdminUserService,
 * and sends standardized HTTP responses via ApiResponse.
 * Contains ZERO business logic.
 */

/**
 * @desc    GET /api/v1/admin/users
 *          List users with search, role, status filters, sorting, and pagination
 * @access  Private (Admin Only)
 */
export const getUsers = asyncHandler(async (req, res) => {
  const result = await adminUserService.listUsers(req.query);

  return new ApiResponse(
    200,
    result.users,
    'Users list retrieved successfully',
    result.pagination
  ).send(res);
});

/**
 * @desc    GET /api/v1/admin/users/:id
 *          Retrieve specific user details by ID
 * @access  Private (Admin Only)
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await adminUserService.getUserById(id);

  return new ApiResponse(
    200,
    user,
    'User details retrieved successfully'
  ).send(res);
});

/**
 * @desc    PATCH /api/v1/admin/users/:id/status
 *          Activate or deactivate user account
 * @access  Private (Admin Only)
 */
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { id: targetUserId } = req.params;
  const adminUserId = req.user._id || req.user.id;

  const updatedUser = await adminUserService.updateUserStatus(
    targetUserId,
    adminUserId,
    req.body
  );

  return new ApiResponse(
    200,
    updatedUser,
    `User status updated successfully to isActive=${updatedUser.isActive}`
  ).send(res);
});

/**
 * @desc    PATCH /api/v1/admin/users/:id/role
 *          Change user authorization role
 * @access  Private (Admin Only)
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { id: targetUserId } = req.params;
  const adminUserId = req.user._id || req.user.id;

  const updatedUser = await adminUserService.updateUserRole(
    targetUserId,
    adminUserId,
    req.body
  );

  return new ApiResponse(
    200,
    updatedUser,
    `User role updated successfully to '${updatedUser.role}'`
  ).send(res);
});

/**
 * @desc    DELETE /api/v1/admin/users/:id
 *          Delete a user account
 * @access  Private (Admin Only)
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id: targetUserId } = req.params;
  const adminUserId = req.user._id || req.user.id;

  const result = await adminUserService.deleteUser(targetUserId, adminUserId);

  return new ApiResponse(
    200,
    result,
    'User account deleted successfully'
  ).send(res);
});
