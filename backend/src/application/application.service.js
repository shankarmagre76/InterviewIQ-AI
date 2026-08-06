import applicationRepository from './application.repository.js';
import jobRepository from '../job/job.repository.js';
import resumeRepository from '../resume/resume.repository.js';
import ApiError from '../utils/ApiError.js';

/**
 * Application Service Layer
 * Contains all business logic, duplicate prevention, resume validation, and pipeline status handling.
 */
class ApplicationService {
  /**
   * Submit a new job application with full business validations.
   * @param {object} applicationData - Application payload (job, resume, coverLetter)
   * @param {object} currentUser - Authenticated candidate user object
   * @returns {Promise<object>} Created application document
   */
  async applyJob(applicationData, currentUser) {
    // 1. Role Permission Check: Candidate/Student roles only
    if (!currentUser || currentUser.role === 'Recruiter') {
      throw ApiError.forbidden('Recruiters cannot submit candidate job applications');
    }

    // 2. Job Listing Existence Verification
    const job = await jobRepository.getJob(applicationData.job);
    if (!job) {
      throw ApiError.notFound('Job posting not found');
    }

    // 3. Job Active Status Check
    if (job.status !== 'Active') {
      throw ApiError.badRequest(`Cannot apply because this job posting is currently '${job.status}'`);
    }

    // 4. Job Application Deadline Validation
    if (job.applicationDeadline) {
      const deadline = new Date(job.applicationDeadline);
      if (new Date() > deadline) {
        throw ApiError.badRequest('The application deadline for this job posting has expired');
      }
    }

    // 5. Business Rule: Duplicate Application Prevention
    const existingApp = await applicationRepository.findExistingApplication(
      currentUser._id,
      job._id
    );
    if (existingApp) {
      throw ApiError.badRequest('You have already submitted an application for this job posting');
    }

    // 6. Resume Validation & Ownership Verification
    const resume = await resumeRepository.getResumeById(applicationData.resume);
    if (!resume || resume.user.toString() !== currentUser._id.toString()) {
      throw ApiError.badRequest('Invalid resume selected or resume does not belong to your account');
    }

    const companyId = job.company?._id || job.company;

    const payload = {
      user: currentUser._id,
      job: job._id,
      company: companyId,
      resume: resume._id,
      coverLetter: applicationData.coverLetter || '',
      status: 'Applied',
    };

    return await applicationRepository.applyJob(payload);
  }

  /**
   * Get single application details with role access control.
   * @param {string} applicationId - Application ObjectId
   * @param {object} currentUser - Authenticated user object
   * @returns {Promise<object>} Populated application document
   */
  async getApplicationDetails(applicationId, currentUser) {
    const application = await applicationRepository.getApplicationById(applicationId);
    if (!application) {
      throw ApiError.notFound('Job application not found');
    }

    // Authorization: Candidate applicant OR Recruiter of company OR Admin
    const isApplicant = application.user._id.toString() === currentUser._id.toString();
    const isCompanyRecruiter =
      currentUser.role === 'Recruiter' &&
      application.company?._id?.toString() === currentUser.companyId?.toString();
    const isAdmin = currentUser.role === 'Admin';

    if (!isApplicant && !isCompanyRecruiter && !isAdmin) {
      throw ApiError.forbidden('You are not authorized to view this job application');
    }

    return application;
  }

  /**
   * Update application status, interview date, or recruiter notes/feedback.
   * @param {string} applicationId - Application ObjectId
   * @param {object} updateData - Status update fields
   * @param {object} currentUser - Authenticated user object
   * @returns {Promise<object>} Updated application document
   */
  async updateApplicationStatus(applicationId, updateData, currentUser) {
    const existingApp = await applicationRepository.getApplicationById(applicationId);
    if (!existingApp) {
      throw ApiError.notFound('Job application not found');
    }

    // Permission Check: Recruiters or Admins only
    if (currentUser.role !== 'Recruiter' && currentUser.role !== 'Admin') {
      throw ApiError.forbidden('Only Recruiters or Admins can update application statuses');
    }

    // Interview Date Requirement check for interview rounds
    const interviewStatuses = ['Interview Scheduled', 'Technical Round', 'HR Round'];
    if (
      updateData.status &&
      interviewStatuses.includes(updateData.status) &&
      !updateData.interviewDate &&
      !existingApp.interviewDate
    ) {
      throw ApiError.badRequest(
        `An interview date must be scheduled when updating status to '${updateData.status}'`
      );
    }

    return await applicationRepository.updateStatus(applicationId, updateData);
  }

  /**
   * Get paginated application history for a candidate user.
   * @param {object} currentUser - Authenticated candidate user
   * @param {object} queryOptions - Pagination and status filters
   * @returns {Promise<object>} Paginated application list
   */
  async getCandidateApplications(currentUser, queryOptions = {}) {
    const filter = { user: currentUser._id };
    if (queryOptions.status) {
      filter.status = queryOptions.status;
    }
    return await applicationRepository.getApplications(filter, queryOptions);
  }

  /**
   * Get paginated candidate applications for a specific job listing.
   * @param {string} jobId - Job ObjectId
   * @param {object} currentUser - Authenticated recruiter user
   * @param {object} queryOptions - Filters and pagination
   * @returns {Promise<object>} Paginated application list
   */
  async getJobApplications(jobId, currentUser, queryOptions = {}) {
    const job = await jobRepository.getJob(jobId, '');
    if (!job) {
      throw ApiError.notFound('Job posting not found');
    }

    // Authorization check
    const isJobOwner = job.createdBy.toString() === currentUser._id.toString();
    const isAdmin = currentUser.role === 'Admin';
    if (!isJobOwner && !isAdmin) {
      throw ApiError.forbidden('You are not authorized to view applications for this job posting');
    }

    const filter = { job: jobId };
    if (queryOptions.status) {
      filter.status = queryOptions.status;
    }

    return await applicationRepository.getApplications(filter, queryOptions);
  }
}

export default new ApplicationService();
export { ApplicationService };
