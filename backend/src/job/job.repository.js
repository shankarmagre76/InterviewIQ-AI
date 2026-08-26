import mongoose from 'mongoose';
import Job from './job.model.js';
import { createSafeRegex } from '../utils/regex.util.js';

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
   * Advanced job search, filter, and pagination using MongoDB Aggregation Pipeline.
   * @param {object} [filter={}] - Base filter options
   * @param {object} [options={}] - Search keyword, companyName, workMode, employmentType, skills, salary, experience, sorting, pagination
   * @returns {Promise<{ jobs: Array, total: number, page: number, limit: number, totalPages: number, hasNextPage: boolean, hasPrevPage: boolean }>}
   */
  async searchJobs(filter = {}, options = {}) {
    const page = Math.max(1, parseInt(options.page || 1, 10));
    const limit = Math.max(1, Math.min(100, parseInt(options.limit || 10, 10)));
    const skip = (page - 1) * limit;

    const matchStage = { ...filter };

    // Safely cast string ObjectIds for MongoDB Aggregation $match stage
    if (matchStage.company && typeof matchStage.company === 'string' && mongoose.Types.ObjectId.isValid(matchStage.company)) {
      matchStage.company = new mongoose.Types.ObjectId(matchStage.company);
    }
    if (matchStage.createdBy && typeof matchStage.createdBy === 'string' && mongoose.Types.ObjectId.isValid(matchStage.createdBy)) {
      matchStage.createdBy = new mongoose.Types.ObjectId(matchStage.createdBy);
    }
    if (matchStage._id && typeof matchStage._id === 'string' && mongoose.Types.ObjectId.isValid(matchStage._id)) {
      matchStage._id = new mongoose.Types.ObjectId(matchStage._id);
    }

    // Default status to Active if not specified and not explicitly fetching all statuses for management
    if (!matchStage.status && !options.includeAllStatuses && !filter.createdBy && !filter.company) {
      matchStage.status = 'Active';
    }

    // WorkMode normalization ('onsite' -> 'On-site')
    if (options.workMode) {
      if (Array.isArray(options.workMode)) {
        matchStage.workMode = {
          $in: options.workMode.map((wm) =>
            wm.toLowerCase() === 'onsite' ? 'On-site' : wm
          ),
        };
      } else if (typeof options.workMode === 'string') {
        const normalizedWM =
          options.workMode.toLowerCase() === 'onsite'
            ? 'On-site'
            : options.workMode;
        matchStage.workMode = normalizedWM;
      }
    }

    // Employment Type filtering
    if (options.employmentType) {
      if (Array.isArray(options.employmentType)) {
        matchStage.employmentType = { $in: options.employmentType };
      } else {
        matchStage.employmentType = options.employmentType;
      }
    }

    // Location search
    if (options.location) {
      const locRegex = createSafeRegex(options.location);
      if (locRegex) matchStage.location = locRegex;
    }

    // Keyword Search across title, description, location, requiredSkills, preferredSkills
    if (options.keyword || options.search) {
      const keywordRegex = createSafeRegex(options.keyword || options.search);
      if (keywordRegex) {
        matchStage.$or = [
          { title: keywordRegex },
          { description: keywordRegex },
          { location: keywordRegex },
          { requiredSkills: keywordRegex },
          { preferredSkills: keywordRegex },
        ];
      }
    }

    // Skills Filter (Matches any skill in input list)
    if (options.skills && Array.isArray(options.skills) && options.skills.length > 0) {
      const skillRegexes = options.skills.map((s) => createSafeRegex(s)).filter(Boolean);
      if (skillRegexes.length > 0) {
        matchStage.$or = [
          ...(matchStage.$or || []),
          { requiredSkills: { $in: skillRegexes } },
          { preferredSkills: { $in: skillRegexes } },
        ];
      }
    }

    // Salary Range Filtering
    if (options.minSalary !== undefined && options.minSalary !== null && options.minSalary !== '') {
      matchStage['salary.min'] = { $gte: Number(options.minSalary) };
    }
    if (options.maxSalary !== undefined && options.maxSalary !== null && options.maxSalary !== '') {
      matchStage['salary.max'] = { $lte: Number(options.maxSalary) };
    }

    // Experience Range Filtering
    if (options.minExp !== undefined && options.minExp !== null && options.minExp !== '') {
      matchStage['experience.minYears'] = { $gte: Number(options.minExp) };
    }
    if (options.maxExp !== undefined && options.maxExp !== null && options.maxExp !== '') {
      matchStage['experience.maxYears'] = { $lte: Number(options.maxExp) };
    }

    // Sorting stage
    let sortStage = { createdAt: -1 }; // Default: Newest
    const sortOption = (typeof options.sort === 'string' ? options.sort : 'newest').toLowerCase();

    if (sortOption === 'oldest') {
      sortStage = { createdAt: 1 };
    } else if (sortOption === 'highest_salary' || sortOption === 'highestsalary') {
      sortStage = { 'salary.max': -1, 'salary.min': -1 };
    } else if (sortOption === 'lowest_salary' || sortOption === 'lowestsalary') {
      sortStage = { 'salary.min': 1, 'salary.max': 1 };
    } else if (sortOption === 'newest') {
      sortStage = { createdAt: -1 };
    } else if (typeof options.sort === 'object') {
      sortStage = options.sort;
    }

    // Aggregation Pipeline
    const pipeline = [
      { $match: matchStage },

      // Join Company Details
      {
        $lookup: {
          from: 'companies',
          localField: 'company',
          foreignField: '_id',
          as: 'company',
        },
      },
      {
        $unwind: {
          path: '$company',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    // Optional company name search filter
    if (options.companyName) {
      const companyRegex = createSafeRegex(options.companyName);
      if (companyRegex) {
        pipeline.push({
          $match: {
            'company.companyName': companyRegex,
          },
        });
      }
    }

    // Join Creator User Details
    pipeline.push(
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdBy',
        },
      },
      {
        $unwind: {
          path: '$createdBy',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          'createdBy.password': 0,
          'createdBy.refreshToken': 0,
          'createdBy.resetPasswordToken': 0,
          'createdBy.emailVerificationToken': 0,
        },
      }
    );

    // Single DB execution for data + total count metadata via $facet
    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        jobs: [{ $sort: sortStage }, { $skip: skip }, { $limit: limit }],
      },
    });

    const [result] = await Job.aggregate(pipeline);

    const total = result?.metadata[0]?.total || 0;
    const jobs = result?.jobs || [];
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      jobs,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
}

export default new JobRepository();
export { JobRepository };
