import companyRepository from '../company/company.repository.js';
import adminAuditLogService from './adminAuditLog.service.js';
import Job from '../job/job.model.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { HIRING_STATUSES } from '../company/company.model.js';

/**
 * Admin Company Service Layer
 * Extends Phase 6 Company capabilities with administrative controls,
 * status transitions, and job association safety guards.
 */
class AdminCompanyService {
  /**
   * 1. Retrieve paginated, searched, and filtered list of companies.
   *
   * @param {Object} queryParams - { page, limit, search, industry, hiringStatus, sortBy, sortOrder }
   * @returns {Promise<Object>} Paginated company list payload
   */
  async listCompanies(queryParams = {}) {
    const {
      page = 1,
      limit = 10,
      search = null,
      industry = null,
      hiringStatus = null,
      status = null,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryParams;

    const filter = {};

    if (industry && String(industry).trim()) {
      filter.industry = String(industry).trim();
    }

    const effectiveStatus = hiringStatus || status;
    if (effectiveStatus && String(effectiveStatus).trim()) {
      filter.hiringStatus = String(effectiveStatus).trim();
    }

    const actualSortOrder = String(sortOrder).toLowerCase() === 'asc' || sortOrder === '1' || sortOrder === 1 ? 1 : -1;
    const sort = { [sortBy]: actualSortOrder };

    return await companyRepository.listCompanies(filter, {
      page: Number(page),
      limit: Number(limit),
      search,
      sort,
    });
  }

  /**
   * 2. Retrieve detailed company document with associated job count.
   *
   * @param {string} companyId
   * @returns {Promise<Object>} Company details with job count
   */
  async getCompanyById(companyId) {
    const company = await companyRepository.getCompany(companyId, 'createdBy');
    if (!company) {
      throw ApiError.notFound('Company profile not found');
    }

    const jobCount = await Job.countDocuments({ company: companyId });

    const companyObj = company.toObject ? company.toObject() : company;
    return {
      ...companyObj,
      associatedJobsCount: jobCount,
    };
  }

  /**
   * 3. Create a new company record via Admin portal.
   *
   * @param {Object} companyData
   * @param {Object} adminUser - Authenticated admin user
   * @returns {Promise<Object>} Created company document
   */
  async createCompany(companyData, adminUser) {
    const existingCompany = await companyRepository.getCompanyByName(companyData.companyName);
    if (existingCompany) {
      throw ApiError.badRequest(`Company with name '${companyData.companyName}' already exists`);
    }

    const adminId = adminUser._id || adminUser.id;
    const payload = {
      ...companyData,
      createdBy: companyData.createdBy || adminId,
    };

    const newCompany = await companyRepository.createCompany(payload);
    logger.info(`Admin (${adminId}) created company (${newCompany._id}) '${newCompany.companyName}'`);

    // Non-blocking Audit Logging
    adminAuditLogService.logAction({
      admin: adminId,
      action: 'CREATE_COMPANY',
      targetType: 'Company',
      targetId: newCompany._id,
      description: `Admin created company profile '${newCompany.companyName}'`,
      metadata: { companyName: newCompany.companyName, industry: newCompany.industry },
    });

    return newCompany;
  }

  /**
   * 4. Update an existing company record via Admin portal.
   *
   * @param {string} companyId
   * @param {Object} updateData
   * @param {Object} [adminUser]
   * @returns {Promise<Object>} Updated company document
   */
  async updateCompany(companyId, updateData, adminUser = null) {
    const existingCompany = await companyRepository.getCompany(companyId, '');
    if (!existingCompany) {
      throw ApiError.notFound('Company profile not found');
    }

    // Duplicate check if companyName is being updated
    if (
      updateData.companyName &&
      updateData.companyName.trim().toLowerCase() !== existingCompany.companyName.toLowerCase()
    ) {
      const nameConflict = await companyRepository.getCompanyByName(updateData.companyName);
      if (nameConflict) {
        throw ApiError.badRequest(`Company name '${updateData.companyName}' is already taken`);
      }
    }

    const updatedCompany = await companyRepository.updateCompany(companyId, updateData);

    // Non-blocking Audit Logging
    if (adminUser) {
      adminAuditLogService.logAction({
        admin: adminUser._id || adminUser.id,
        action: 'UPDATE_COMPANY',
        targetType: 'Company',
        targetId: companyId,
        description: `Admin updated company profile '${updatedCompany.companyName}'`,
        metadata: { updatedFields: Object.keys(updateData) },
      });
    }

    return updatedCompany;
  }

  /**
   * 5. Update company hiring/active status.
   *
   * @param {string} companyId
   * @param {Object} statusData - { hiringStatus } or { status, isActive }
   * @param {Object} [adminUser]
   * @returns {Promise<Object>} Updated company document
   */
  async updateCompanyStatus(companyId, statusData = {}, adminUser = null) {
    const existingCompany = await companyRepository.getCompany(companyId, '');
    if (!existingCompany) {
      throw ApiError.notFound('Company profile not found');
    }

    let targetHiringStatus = statusData.hiringStatus || statusData.status;

    // Support boolean isActive payload mapping
    if (statusData.isActive !== undefined && !targetHiringStatus) {
      targetHiringStatus = statusData.isActive ? 'Actively Hiring' : 'Hiring Freeze';
    }

    if (!targetHiringStatus || !HIRING_STATUSES.includes(targetHiringStatus)) {
      throw ApiError.badRequest(
        `Invalid hiring status '${targetHiringStatus}'. Allowed values: ${HIRING_STATUSES.join(', ')}`
      );
    }

    const updatedCompany = await companyRepository.updateCompany(companyId, {
      hiringStatus: targetHiringStatus,
    });

    // Non-blocking Audit Logging
    if (adminUser) {
      adminAuditLogService.logAction({
        admin: adminUser._id || adminUser.id,
        action: 'UPDATE_COMPANY',
        targetType: 'Company',
        targetId: companyId,
        description: `Admin updated company hiring status to '${targetHiringStatus}'`,
        metadata: { previousStatus: existingCompany.hiringStatus, newStatus: targetHiringStatus },
      });
    }

    return updatedCompany;
  }

  /**
   * 6. Delete a company record with Job Safety Guard.
   *
   * @param {string} companyId
   * @param {Object} [options={ force: false, adminUser: null }]
   * @returns {Promise<Object>} Deletion confirmation payload
   */
  async deleteCompany(companyId, options = {}) {
    const existingCompany = await companyRepository.getCompany(companyId, '');
    if (!existingCompany) {
      throw ApiError.notFound('Company profile not found');
    }

    // Safety Guard: Check if company has associated job listings
    const associatedJobsCount = await Job.countDocuments({ company: companyId });

    if (associatedJobsCount > 0 && !options.force) {
      throw ApiError.badRequest(
        `Cannot delete company '${existingCompany.companyName}' because it has ${associatedJobsCount} active job postings. Deactivate hiring status or pass force=true to delete.`
      );
    }

    // If force delete requested, cascade delete jobs
    if (associatedJobsCount > 0 && options.force) {
      await Job.deleteMany({ company: companyId });
      logger.info(`Cascade deleted ${associatedJobsCount} jobs for company (${companyId})`);
    }

    await companyRepository.deleteCompany(companyId);
    logger.info(`Deleted company profile (${companyId}) '${existingCompany.companyName}'`);

    // Non-blocking Audit Logging
    if (options.adminUser) {
      adminAuditLogService.logAction({
        admin: options.adminUser._id || options.adminUser.id,
        action: 'DELETE_COMPANY',
        targetType: 'Company',
        targetId: companyId,
        description: `Admin deleted company profile '${existingCompany.companyName}'`,
        metadata: { companyName: existingCompany.companyName, removedJobsCount: associatedJobsCount },
      });
    }

    return {
      message: 'Company profile deleted successfully',
      deletedCompanyId: companyId,
      removedJobsCount: associatedJobsCount,
    };
  }
}

export const adminCompanyService = new AdminCompanyService();
export default adminCompanyService;
