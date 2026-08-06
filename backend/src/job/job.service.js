import jobRepository from './job.repository.js';
import companyRepository from '../company/company.repository.js';
import ApiError from '../utils/ApiError.js';

/**
 * Job Service Layer
 * Contains all business logic, permission checks, company validations, and search processing for Job management.
 */
class JobService {
  /**
   * Create a new job posting with business validations.
   * @param {object} jobData - Job payload object
   * @param {object} currentUser - Authenticated user object
   * @returns {Promise<object>} Created Job document
   */
  async createJob(jobData, currentUser) {
    // 1. Role Permission Check: Recruiter or Admin only
    if (!currentUser || (currentUser.role !== 'Recruiter' && currentUser.role !== 'Admin')) {
      throw ApiError.forbidden('Only Recruiters or Admins can post job listings');
    }

    // 2. Associated Company Verification
    const company = await companyRepository.getCompany(jobData.company, '');
    if (!company) {
      throw ApiError.notFound('Associated company profile not found');
    }

    // 3. Company Ownership Check
    const isCompanyOwner = company.createdBy.toString() === currentUser._id.toString();
    const isAdmin = currentUser.role === 'Admin';
    if (!isCompanyOwner && !isAdmin) {
      throw ApiError.forbidden('You can only post jobs for companies you own/manage');
    }

    // 4. Company Hiring Availability Check
    if (company.hiringStatus === 'Closed' || company.hiringStatus === 'Not Hiring') {
      throw ApiError.badRequest(
        `Cannot post new jobs because company hiring status is currently '${company.hiringStatus}'`
      );
    }

    // 5. Deadline Validation Rule: Application deadline must be in the future
    if (jobData.applicationDeadline) {
      const deadline = new Date(jobData.applicationDeadline);
      const now = new Date();
      if (deadline <= now) {
        throw ApiError.badRequest('Application deadline must be a future date');
      }
    }

    const payload = {
      ...jobData,
      createdBy: currentUser._id,
    };

    return await jobRepository.createJob(payload);
  }

  /**
   * Get detailed job posting by ID.
   * @param {string} jobId - Job ObjectId
   * @returns {Promise<object>} Job document
   */
  async getJobDetails(jobId) {
    const job = await jobRepository.getJob(jobId);
    if (!job) {
      throw ApiError.notFound('Job posting not found');
    }
    return job;
  }

  /**
   * Update an existing job posting with ownership checks.
   * @param {string} jobId - Job ObjectId
   * @param {object} updateData - Fields to update
   * @param {object} currentUser - Authenticated user object
   * @returns {Promise<object>} Updated job document
   */
  async updateJob(jobId, updateData, currentUser) {
    const existingJob = await jobRepository.getJob(jobId, '');
    if (!existingJob) {
      throw ApiError.notFound('Job posting not found');
    }

    // Ownership check: Job creator or Admin
    const isJobOwner = existingJob.createdBy.toString() === currentUser._id.toString();
    const isAdmin = currentUser.role === 'Admin';
    if (!isJobOwner && !isAdmin) {
      throw ApiError.forbidden('You are not authorized to update this job posting');
    }

    // Validate deadline if updated
    if (updateData.applicationDeadline) {
      const deadline = new Date(updateData.applicationDeadline);
      const now = new Date();
      if (deadline <= now) {
        throw ApiError.badRequest('Application deadline must be a future date');
      }
    }

    return await jobRepository.updateJob(jobId, updateData);
  }

  /**
   * Delete a job posting.
   * @param {string} jobId - Job ObjectId
   * @param {object} currentUser - Authenticated user object
   * @returns {Promise<object>} Deleted job document
   */
  async deleteJob(jobId, currentUser) {
    const existingJob = await jobRepository.getJob(jobId, '');
    if (!existingJob) {
      throw ApiError.notFound('Job posting not found');
    }

    const isJobOwner = existingJob.createdBy.toString() === currentUser._id.toString();
    const isAdmin = currentUser.role === 'Admin';
    if (!isJobOwner && !isAdmin) {
      throw ApiError.forbidden('You are not authorized to delete this job posting');
    }

    return await jobRepository.deleteJob(jobId);
  }

  /**
   * Search, filter, and paginate job listings with advanced query options.
   * @param {object} queryParams - Search terms, filters, pagination, and sorting
   * @returns {Promise<object>} Paginated job results with metadata
   */
  async searchJobs(queryParams = {}) {
    const {
      keyword,
      search,
      company,
      companyName,
      workMode,
      employmentType,
      status,
      location,
      skills,
      minSalary,
      maxSalary,
      minExp,
      maxExp,
      page,
      limit,
      sort,
    } = queryParams;

    const filter = {};
    if (status) filter.status = status;
    if (company && typeof company === 'string' && company.match(/^[0-9a-fA-F]{24}$/)) {
      filter.company = company;
    }

    // Helper to parse array or comma-separated string parameters
    const parseListParam = (param) => {
      if (!param) return undefined;
      if (Array.isArray(param)) return param;
      if (typeof param === 'string') return param.split(',').map((s) => s.trim()).filter(Boolean);
      return undefined;
    };

    const options = {
      keyword: keyword || search,
      companyName,
      location,
      workMode: parseListParam(workMode),
      employmentType: parseListParam(employmentType),
      skills: parseListParam(skills),
      minSalary,
      maxSalary,
      minExp,
      maxExp,
      page,
      limit,
      sort,
    };

    return await jobRepository.searchJobs(filter, options);
  }
}

export default new JobService();
export { JobService };
