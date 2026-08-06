import companyService from './company.service.js';
import asyncHandler from '../middleware/async.middleware.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * @desc    Create a new company profile
 * @route   POST /api/v1/companies
 * @access  Private (Recruiter/Admin)
 */
export const createCompany = asyncHandler(async (req, res) => {
  const company = await companyService.createCompany(req.body, req.user);
  return new ApiResponse(201, company, 'Company profile created successfully').send(res);
});

/**
 * @desc    Get company profile details by ID
 * @route   GET /api/v1/companies/:id
 * @access  Public
 */
export const getCompany = asyncHandler(async (req, res) => {
  const company = await companyService.getCompany(req.params.id);
  return new ApiResponse(200, company, 'Company profile retrieved successfully').send(res);
});

/**
 * @desc    Update company profile details
 * @route   PUT /api/v1/companies/:id
 * @access  Private (Company Owner/Admin)
 */
export const updateCompany = asyncHandler(async (req, res) => {
  const company = await companyService.updateCompany(req.params.id, req.body, req.user);
  return new ApiResponse(200, company, 'Company profile updated successfully').send(res);
});

/**
 * @desc    Delete company profile
 * @route   DELETE /api/v1/companies/:id
 * @access  Private (Company Owner/Admin)
 */
export const deleteCompany = asyncHandler(async (req, res) => {
  await companyService.deleteCompany(req.params.id, req.user);
  return new ApiResponse(200, null, 'Company profile deleted successfully').send(res);
});

/**
 * @desc    List companies with pagination & filtering
 * @route   GET /api/v1/companies
 * @access  Public
 */
export const listCompanies = asyncHandler(async (req, res) => {
  const { industry, hiringStatus, createdBy, search, page, limit, sort } = req.query;

  const queryFilter = {};
  if (industry) queryFilter.industry = industry;
  if (hiringStatus) queryFilter.hiringStatus = hiringStatus;
  if (createdBy) queryFilter.createdBy = createdBy;

  const paginationOptions = { search, page, limit, sort };

  const result = await companyService.listCompanies(queryFilter, paginationOptions);

  return new ApiResponse(200, result.companies, 'Companies retrieved successfully', {
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
  }).send(res);
});

export default {
  createCompany,
  getCompany,
  updateCompany,
  deleteCompany,
  listCompanies,
};
