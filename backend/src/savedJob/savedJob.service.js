import savedJobRepository from './savedJob.repository.js';
import jobRepository from '../job/job.repository.js';
import ApiError from '../utils/ApiError.js';

/**
 * SavedJob Service Layer
 * Contains all business logic, duplicate bookmark prevention, and candidate job saving rules.
 */
class SavedJobService {
  /**
   * Save / Bookmark a job listing for a candidate user.
   * @param {string} jobId - Job ObjectId
   * @param {object} currentUser - Authenticated user object
   * @returns {Promise<object>} Created SavedJob document
   */
  async saveJob(jobId, currentUser) {
    // 1. Role Permission Check
    if (!currentUser || currentUser.role === 'Recruiter') {
      throw ApiError.forbidden('Recruiters cannot bookmark job listings');
    }

    // 2. Job Existence Verification
    const job = await jobRepository.getJob(jobId);
    if (!job) {
      throw ApiError.notFound('Job posting not found');
    }

    // 3. Active Status Check
    if (job.status !== 'Active') {
      throw ApiError.badRequest(`Cannot save job because it is currently '${job.status}'`);
    }

    // 4. Duplicate Bookmark Prevention Check
    const isAlreadySaved = await savedJobRepository.isJobSaved(currentUser._id, jobId);
    if (isAlreadySaved) {
      throw ApiError.badRequest('This job posting is already in your saved jobs list');
    }

    return await savedJobRepository.saveJob(currentUser._id, jobId);
  }

  /**
   * Remove a job bookmark for a candidate user.
   * @param {string} jobId - Job ObjectId
   * @param {object} currentUser - Authenticated user object
   * @returns {Promise<object>} Result message object
   */
  async unsaveJob(jobId, currentUser) {
    const deletedRecord = await savedJobRepository.unsaveJob(currentUser._id, jobId);
    if (!deletedRecord) {
      throw ApiError.notFound('Job bookmark not found in your saved list');
    }
    return { message: 'Job successfully removed from saved list' };
  }

  /**
   * Get paginated saved jobs for a candidate user.
   * @param {object} currentUser - Authenticated candidate user
   * @param {object} queryOptions - Pagination options
   * @returns {Promise<object>} Paginated saved jobs list
   */
  async getUserSavedJobs(currentUser, queryOptions = {}) {
    return await savedJobRepository.getSavedJobs(currentUser._id, queryOptions);
  }

  /**
   * Check whether a specific job is saved by the current candidate user.
   * @param {string} jobId - Job ObjectId
   * @param {object} currentUser - Authenticated user object
   * @returns {Promise<{ isSaved: boolean }>} Saved status object
   */
  async checkIsJobSaved(jobId, currentUser) {
    if (!currentUser) return { isSaved: false };
    const isSaved = await savedJobRepository.isJobSaved(currentUser._id, jobId);
    return { isSaved };
  }
}

export default new SavedJobService();
export { SavedJobService };
