import Job from './job.model.js';

/**
 * Job Repository Layer
 * Handles pure MongoDB / Mongoose database operations for Job entity.
 * Contains ZERO business logic.
 */
class JobRepository {
  /**
   * Create a new job document in MongoDB.
   * @param {object} jobData - Object containing job schema fields
   * @param {import('mongoose').ClientSession} [session=null] - Optional transaction session
   * @returns {Promise<import('./job.model.js').default>} Created Job document
   */
  async createJob(jobData, session = null) {
    const options = session ? { session } : {};
    if (session) {
      const [newJob] = await Job.create([jobData], options);
      return newJob;
    }
    return await Job.create(jobData);
  }

  /**
   * Retrieve a job document by its MongoDB ObjectId.
   * @param {string|import('mongoose').Types.ObjectId} id - Job ObjectId
   * @param {string} [populateFields='company createdBy'] - Fields to populate
   * @returns {Promise<import('./job.model.js').default|null>} Job document or null
   */
  async getJob(id, populateFields = 'company createdBy') {
    let query = Job.findById(id);
    if (populateFields) {
      query = query
        .populate('company', 'companyName companyLogo website headquarters industry companySize hiringStatus')
        .populate('createdBy', 'firstName lastName email role');
    }
    return await query.exec();
  }

  /**
   * Alias method for getJob.
   */
  async getJobById(id, populateFields = 'company createdBy') {
    return await this.getJob(id, populateFields);
  }

  /**
   * Update an existing job document by ID.
   * @param {string|import('mongoose').Types.ObjectId} id - Job ObjectId
   * @param {object} updateData - Fields to update
   * @param {object} [options={ new: true, runValidators: true }] - Query options
   * @returns {Promise<import('./job.model.js').default|null>} Updated Job document
   */
  async updateJob(
    id,
    updateData,
    options = { new: true, runValidators: true }
  ) {
    return await Job.findByIdAndUpdate(id, updateData, options);
  }

  /**
   * Delete a job document by ID.
   * @param {string|import('mongoose').Types.ObjectId} id - Job ObjectId
   * @param {import('mongoose').ClientSession} [session=null] - Optional transaction session
   * @returns {Promise<import('./job.model.js').default|null>} Deleted Job document
   */
  async deleteJob(id, session = null) {
    const options = session ? { session } : {};
    return await Job.findByIdAndDelete(id, options);
  }

  /**
   * Flexible job search, filter, and pagination query.
   * @param {object} [filter={}] - Filter options (status, workMode, employmentType, company, location, skills, minSalary, maxSalary, minExp, maxExp)
   * @param {object} [options={}] - Search string, sorting, limit, page
   * @returns {Promise<{ jobs: Array, total: number, page: number, totalPages: number }>}
   */
  async searchJobs(filter = {}, options = {}) {
    const page = Math.max(1, parseInt(options.page || 1, 10));
    const limit = Math.max(1, parseInt(options.limit || 10, 10));
    const skip = (page - 1) * limit;
    const sort = options.sort || { createdAt: -1 };

    const queryFilter = { ...filter };

    // Default filter active jobs if status not explicitly requested
    if (!queryFilter.status) {
      queryFilter.status = 'Active';
    }

    // Keyword Search (Full-text index or regex search)
    if (options.search) {
      const searchTrimmed = options.search.trim();
      queryFilter.$or = [
        { title: new RegExp(searchTrimmed, 'i') },
        { location: new RegExp(searchTrimmed, 'i') },
        { requiredSkills: new RegExp(searchTrimmed, 'i') },
      ];
    }

    // Required Skills Matching (Matches any skill in array)
    if (options.skills && Array.isArray(options.skills) && options.skills.length > 0) {
      queryFilter.requiredSkills = { $in: options.skills.map((s) => new RegExp(s.trim(), 'i')) };
    }

    // Salary Min/Max Filtering
    if (options.minSalary) {
      queryFilter['salary.min'] = { $gte: Number(options.minSalary) };
    }
    if (options.maxSalary) {
      queryFilter['salary.max'] = { $lte: Number(options.maxSalary) };
    }

    // Experience Years Filtering
    if (options.minExp !== undefined) {
      queryFilter['experience.minYears'] = { $gte: Number(options.minExp) };
    }
    if (options.maxExp !== undefined) {
      queryFilter['experience.maxYears'] = { $lte: Number(options.maxExp) };
    }

    const [jobs, total] = await Promise.all([
      Job.find(queryFilter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('company', 'companyName companyLogo website headquarters industry companySize hiringStatus')
        .populate('createdBy', 'firstName lastName email')
        .exec(),
      Job.countDocuments(queryFilter),
    ]);

    return {
      jobs,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}

export default new JobRepository();
export { JobRepository };
