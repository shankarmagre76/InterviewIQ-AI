import Application from './application.model.js';

/**
 * Application Repository Layer
 * Handles pure MongoDB / Mongoose database operations for Application entity.
 * Contains ZERO business logic.
 */
class ApplicationRepository {
  /**
   * Create a new job application document.
   * @param {object} applicationData - Application fields (user, job, company, resume, coverLetter)
   * @param {import('mongoose').ClientSession} [session=null] - Optional transaction session
   * @returns {Promise<import('./application.model.js').default>} Created Application document
   */
  async applyJob(applicationData, session = null) {
    const options = session ? { session } : {};
    if (session) {
      const [newApplication] = await Application.create([applicationData], options);
      return newApplication;
    }
    return await Application.create(applicationData);
  }

  /**
   * Alias method for applyJob.
   */
  async createApplication(applicationData, session = null) {
    return await this.applyJob(applicationData, session);
  }

  /**
   * Retrieve an application document by its ID with populated references.
   * @param {string|import('mongoose').Types.ObjectId} id - Application ObjectId
   * @returns {Promise<import('./application.model.js').default|null>} Populated application document or null
   */
  async getApplicationById(id) {
    return await Application.findById(id)
      .populate('user', 'firstName lastName email profileImage phone')
      .populate({
        path: 'job',
        select: 'title location workMode employmentType salary status experience applicationDeadline',
        populate: { path: 'company', select: 'companyName companyLogo website' },
      })
      .populate('company', 'companyName companyLogo website industry headquarters')
      .populate('resume', 'originalName url fileSize mimeType')
      .exec();
  }

  /**
   * Retrieve a paginated list of applications based on filters (user, job, company, status).
   * @param {object} [filter={}] - Query filter object
   * @param {object} [options={}] - Options (page, limit, sort)
   * @returns {Promise<{ applications: Array, total: number, page: number, totalPages: number }>}
   */
  async getApplications(filter = {}, options = {}) {
    const page = Math.max(1, parseInt(options.page || 1, 10));
    const limit = Math.max(1, parseInt(options.limit || 10, 10));
    const skip = (page - 1) * limit;
    const sort = options.sort || { appliedAt: -1 };

    const queryFilter = { ...filter };

    const [applications, total] = await Promise.all([
      Application.find(queryFilter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('user', 'firstName lastName email profileImage phone')
        .populate({
          path: 'job',
          select: 'title location workMode employmentType salary status applicationDeadline',
          populate: { path: 'company', select: 'companyName companyLogo' },
        })
        .populate('company', 'companyName companyLogo website')
        .populate('resume', 'originalName url fileSize')
        .exec(),
      Application.countDocuments(queryFilter),
    ]);

    return {
      applications,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Update status or feedback details for an application.
   * @param {string|import('mongoose').Types.ObjectId} id - Application ObjectId
   * @param {object} updateData - Object containing status, interviewDate, recruiterNotes, feedback
   * @param {object} [options={ new: true, runValidators: true }] - Mongoose query options
   * @returns {Promise<import('./application.model.js').default|null>} Updated application document
   */
  async updateStatus(
    id,
    updateData,
    options = { new: true, runValidators: true }
  ) {
    return await Application.findByIdAndUpdate(id, updateData, options);
  }

  /**
   * Find existing application for a given candidate user and job.
   * @param {string|import('mongoose').Types.ObjectId} user - User ObjectId
   * @param {string|import('mongoose').Types.ObjectId} job - Job ObjectId
   * @returns {Promise<import('./application.model.js').default|null>} Existing application document or null
   */
  async findExistingApplication(user, job) {
    return await Application.findOne({ user, job });
  }

  /**
   * Count total applications for a specific job.
   * @param {string|import('mongoose').Types.ObjectId} job - Job ObjectId
   * @returns {Promise<number>} Total count of applications
   */
  async countApplicationsByJob(job) {
    return await Application.countDocuments({ job });
  }
}

export default new ApplicationRepository();
export { ApplicationRepository };
