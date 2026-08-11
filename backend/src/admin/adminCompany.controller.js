import asyncHandler from '../middleware/async.middleware.js';
import ApiResponse from '../utils/ApiResponse.js';
import adminCompanyService from './adminCompany.service.js';

/**
 * Admin Company Controller Layer
 * Handles HTTP requests for admin company management, delegates to AdminCompanyService,
 * and sends standardized HTTP responses via ApiResponse.
 * Contains ZERO business logic.
 */

/**
 * @desc    GET /api/v1/admin/companies
 *          Retrieve paginated list of companies with search and filters
 * @access  Private (Admin Only)
 */
export const listCompanies = asyncHandler(async (req, res) => {
  const result = await adminCompanyService.listCompanies(req.query);

  return new ApiResponse(
    200,
    result.companies,
    'Companies list retrieved successfully',
    {
      total: result.total,
      page: result.page,
      limit: Number(req.query.limit || 10),
      totalPages: result.totalPages,
    }
  ).send(res);
});

/**
 * @desc    POST /api/v1/admin/companies
 *          Create a new company profile via Admin portal
 * @access  Private (Admin Only)
 */
export const createCompany = asyncHandler(async (req, res) => {
  const adminUser = req.user;
  const newCompany = await adminCompanyService.createCompany(req.body, adminUser);

  return new ApiResponse(
    201,
    newCompany,
    'Company profile created successfully via Admin portal'
  ).send(res);
});

/**
 * @desc    GET /api/v1/admin/companies/:id
 *          Retrieve company profile details by ID
 * @access  Private (Admin Only)
 */
export const getCompanyById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const company = await adminCompanyService.getCompanyById(id);

  return new ApiResponse(
    200,
    company,
    'Company profile retrieved successfully'
  ).send(res);
});

/**
 * @desc    PUT or PATCH /api/v1/admin/companies/:id
 *          Update company profile details
 * @access  Private (Admin Only)
 */
export const updateCompany = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedCompany = await adminCompanyService.updateCompany(id, req.body);

  return new ApiResponse(
    200,
    updatedCompany,
    'Company profile updated successfully'
  ).send(res);
});

/**
 * @desc    PATCH /api/v1/admin/companies/:id/status
 *          Update company hiring status (Actively Hiring, Hiring Freeze, Closed, etc.)
 * @access  Private (Admin Only)
 */
export const updateCompanyStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedCompany = await adminCompanyService.updateCompanyStatus(id, req.body);

  return new ApiResponse(
    200,
    updatedCompany,
    `Company status updated successfully to '${updatedCompany.hiringStatus}'`
  ).send(res);
});

/**
 * @desc    DELETE /api/v1/admin/companies/:id
 *          Delete company profile (with Job Safety Guard)
 * @access  Private (Admin Only)
 */
export const deleteCompany = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const force = req.query.force === 'true' || req.body.force === true;

  const result = await adminCompanyService.deleteCompany(id, { force });

  return new ApiResponse(
    200,
    result,
    'Company profile deleted successfully'
  ).send(res);
});
