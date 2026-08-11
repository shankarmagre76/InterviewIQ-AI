import jobRepository from '../job/job.repository.js';
import companyRepository from '../company/company.repository.js';
import Application from '../application/application.model.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { JOB_STATUSES } from '../job/job.model.js';

/**
 * Admin Job Service Layer
 * Extends Phase 6 Job capabilities with administrative controls,
 * status transitions, company relation validations, and Application Safety Guards.
 */
class AdminJobService {
  /**
   * Helper to parse array or comma-separated string query parameters
   */
  parseListParam(param) {
    if (!param) return undefined;
    if (Array.isArray(param)) return param;
    if (typeof param === 'string') return param.split(',').map((s) => s.trim()).filter(Boolean);
    return undefined;
  }

  /**
   * 1. Retrieve paginated, searched, and filtered list of all jobs across any status.
   *
   * @param {Object} queryParams - { page, limit, search, keyword, company, status, workMode, employmentType, sort }
   * @returns {Promise<Object>} Paginated job list payload
   */
  async listJobs(queryParams = {}) {
    const {
      page = 1,
      limit = 10,
      search = null,
      keyword = null,
      company = null,
      companyName = null,
      status = null,
      workMode = null,
      employmentType = null,
      location = null,
      sort = 'newest',
    } = queryParams;

    const filter = {};

    // Allow filtering by specific status if provided; otherwise match all job statuses for admin
    if (status && String(status).trim()) {
      filter.status = String(status).trim();
    } else {
      // By default for Admin, allow any status in JOB_STATUSES
      filter.status = { $in: JOB_STATUSES };
    }

    if (company && typeof company === 'string' && company.match(/^[0-9a-fA-F]{24}$/)) {
      filter.company = company;
    }

    const options = {
      keyword: keyword || search,
      companyName,
      location,
      workMode: this.parseListParam(workMode),
      employmentType: this.parseListParam(employmentType),
      page: Number(page),
      limit: Number(limit),
      sort,
    };

    return await jobRepository.searchJobs(filter, options);
  }

  /**
   * 2. Retrieve detailed job posting by ID with candidate application count.
   *
   * @param {string} jobId
   * @returns {Promise<Object>} Job details with application count metadata
   */
  async getJobById(jobId) {
    const job = await jobRepository.getJob(jobId, 'company createdBy');
    if (!job) {
      throw ApiError.notFound('Job posting not found');
    }

    const applicationsCount = await Application.countDocuments({ job: jobId });

    const jobObj = job.toObject ? job.toObject() : job;
    return {
      ...jobObj,
      associatedApplicationsCount: applicationsCount,
    };
  }

  /**
   * 3. Create a new job posting via Admin portal.
   *
   * @param {Object} jobData
   * @param {Object} adminUser - Authenticated admin user
   * @returns {Promise<Object>} Created job document
   */
  async createJob(jobData, adminUser) {
    // Verify associated company exists
    const company = await companyRepository.getCompany(jobData.company, '');
    if (!company) {
      throw ApiError.notFound('Associated company profile not found');
    }

    // Deadline validation rule
    if (jobData.applicationDeadline) {
      const deadline = new Date(jobData.applicationDeadline);
      if (deadline <= new Date()) {
        throw ApiError.badRequest('Application deadline must be a future date');
      }
    }

    const payload = {
      ...jobData,
      createdBy: jobData.createdBy || adminUser._id || adminUser.id,
    };

    const newJob = await jobRepository.createJob(payload);
    logger.info(`Admin (${adminUser._id || adminUser.id}) created job (${newJob._id}) '${newJob.title}'`);
    return newJob;
  }

  /**
   * 4. Update an existing job posting via Admin portal.
   *
   * @param {string} jobId
   * @param {Object} updateData
   * @returns {Promise<Object>} Updated job document
   */
  async updateJob(jobId, updateData) {
    const existingJob = await jobRepository.getJob(jobId, '');
    if (!existingJob) {
      throw ApiError.notFound('Job posting not found');
    }

    // If company is being updated, verify new company exists
    if (updateData.company) {
      const company = await companyRepository.getCompany(updateData.company, '');
      if (!company) {
        throw ApiError.notFound('Associated company profile not found');
      }
    }

    // Validate deadline if updated
    if (updateData.applicationDeadline) {
      const deadline = new Date(updateData.applicationDeadline);
      if (deadline <= new Date()) {
        throw ApiError.badRequest('Application deadline must be a future date');
      }
    }

    return await jobRepository.updateJob(jobId, updateData);
  }

  /**
   * 5. Update job status (Active, Paused, Closed, Draft, Expired).
   *
   * @param {string} jobId
   * @param {Object} statusData - { status: string } or { isActive: boolean }
   * @returns {Promise<Object>} Updated job document
   */
  async updateJobStatus(jobId, statusData = {}) {
    const existingJob = await jobRepository.getJob(jobId, '');
    if (!existingJob) {
      throw ApiError.notFound('Job posting not found');
    }

    let targetStatus = statusData.status;

    // Support boolean isActive payload mapping
    if (statusData.isActive !== undefined && !targetStatus) {
      targetStatus = statusData.isActive ? 'Active' : 'Paused';
    }

    if (!targetStatus || !JOB_STATUSES.includes(targetStatus)) {
      throw ApiError.badRequest(
        `Invalid job status '${targetStatus}'. Allowed status values: ${JOB_STATUSES.join(', ')}`
      );
    }

    return await jobRepository.updateJob(jobId, { status: targetStatus });
  }

  /**
   * 6. Delete job posting with Application Safety Guard.
   *
   * @param {string} jobId
   * @param {Object} [options={ force: false }]
   * @returns {Promise<Object>} Deletion confirmation payload
   */
  async deleteJob(jobId, options = {}) {
    const existingJob = await jobRepository.getJob(jobId, '');
    if (!existingJob) {
      throw ApiError.notFound('Job posting not found');
    }

    // Application Safety Guard: Check if candidate applications exist for this job
    const associatedApplicationsCount = await Application.countDocuments({ job: jobId });

    if (associatedApplicationsCount > 0 && !options.force) {
      throw ApiError.badRequest(
        `Cannot delete job posting '${existingJob.title}' because it has ${associatedApplicationsCount} submitted candidate applications. Pause/close the job status or pass force=true to delete.`
      );
    }

    // If force delete requested, delete associated candidate applications safely
    if (associatedApplicationsCount > 0 && options.force) {
      await Application.deleteMany({ job: jobId });
      logger.info(`Cascade deleted ${associatedApplicationsCount} candidate applications for job (${jobId})`);
    }

    await jobRepository.deleteJob(jobId);
    logger.info(`Deleted job posting (${jobId}) '${existingJob.title}'`);

    return {
      message: 'Job posting deleted successfully',
      deletedJobId: jobId,
      removedApplicationsCount: associatedApplicationsCount,
    };
  }
}

export const adminJobService = new AdminJobService();
export default adminJobService;
