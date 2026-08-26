import SavedJob from './savedJob.model.js';

/**
 * SavedJob Repository Layer
 * Handles pure MongoDB / Mongoose database operations for SavedJob entity.
 * Contains ZERO business logic.
 */
class SavedJobRepository {
  /**
   * Save / Bookmark a job for a candidate user.
   * @param {string|import('mongoose').Types.ObjectId} user - User ObjectId
   * @param {string|import('mongoose').Types.ObjectId} job - Job ObjectId
   * @param {import('mongoose').ClientSession} [session=null] - Optional transaction session
   * @returns {Promise<import('./savedJob.model.js').default>} SavedJob document
   */
  async saveJob(user, job, session = null) {
    const options = session ? { session } : {};
    const payload = { user, job, savedAt: new Date() };

    if (session) {
      const [newSavedJob] = await SavedJob.create([payload], options);
      return newSavedJob;
    }
    return await SavedJob.create(payload);
  }

  /**
   * Unsave / Remove a job bookmark for a candidate user.
   * @param {string|import('mongoose').Types.ObjectId} user - User ObjectId
   * @param {string|import('mongoose').Types.ObjectId} job - Job ObjectId
   * @param {import('mongoose').ClientSession} [session=null] - Optional transaction session
   * @returns {Promise<import('./savedJob.model.js').default|null>} Deleted SavedJob document or null
   */
  async unsaveJob(user, job, session = null) {
    const options = session ? { session } : {};
    return await SavedJob.findOneAndDelete({ user, job }, options);
  }

  /**
   * Retrieve a paginated list of saved jobs for a user.
   * @param {string|import('mongoose').Types.ObjectId} user - User ObjectId
   * @param {object} [options={}] - Options (page, limit, sort)
   * @returns {Promise<{ savedJobs: Array, total: number, page: number, totalPages: number }>}
   */
  async getSavedJobs(user, options = {}) {
    const page = Math.max(1, parseInt(options.page || 1, 10));
    const limit = Math.max(1, parseInt(options.limit || 10, 10));
    const skip = (page - 1) * limit;
    const sort = options.sort || { savedAt: -1 };

    const queryFilter = { user };

    const [savedJobs, total] = await Promise.all([
      SavedJob.find(queryFilter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'job',
          select:
            'title description location workMode employmentType salary status experience applicationDeadline',
          populate: {
            path: 'company',
            select: 'companyName companyLogo website headquarters industry hiringStatus',
          },
        })
        .exec(),
      SavedJob.countDocuments(queryFilter),
    ]);

    return {
      savedJobs,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Check if a specific job is saved by a candidate user.
   * @param {string|import('mongoose').Types.ObjectId} user - User ObjectId
   * @param {string|import('mongoose').Types.ObjectId} job - Job ObjectId
   * @returns {Promise<boolean>} True if saved, false otherwise
   */
  async isJobSaved(user, job) {
    const record = await SavedJob.findOne({ user, job });
    return !!record;
  }

  /**
   * Count total saved jobs for a user.
   * @param {string|import('mongoose').Types.ObjectId} user - User ObjectId
   * @returns {Promise<number>} Total count of saved jobs
   */
  async countSavedJobsByUser(user) {
    return await SavedJob.countDocuments({ user });
  }
}

export default new SavedJobRepository();
export { SavedJobRepository };
