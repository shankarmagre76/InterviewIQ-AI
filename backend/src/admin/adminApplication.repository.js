import Application from '../application/application.model.js';
import mongoose from 'mongoose';

/**
 * Admin Application Repository Layer
 * Handles database operations and MongoDB aggregation pipelines for platform-wide application monitoring.
 * Contains ZERO business logic.
 */
class AdminApplicationRepository {
  /**
   * 1. Retrieve paginated applications with populated references.
   *
   * @param {Object} [filter={}] - Filter criteria (status, company, job, dateFrom, dateTo)
   * @param {Object} [options={}] - Pagination & sorting options (page, limit, sort)
   * @returns {Promise<{ applications: Array, total: number, page: number, totalPages: number }>}
   */
  async listApplications(filter = {}, options = {}) {
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
          select: 'title location workMode employmentType salary status experience applicationDeadline',
          populate: { path: 'company', select: 'companyName companyLogo' },
        })
        .populate('company', 'companyName companyLogo website industry headquarters')
        .populate('resume', 'originalName url fileSize mimeType')
        .exec(),
      Application.countDocuments(queryFilter),
    ]);

    return {
      applications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * 2. Retrieve single application details by ID with populated references.
   *
   * @param {string|import('mongoose').Types.ObjectId} id
   * @returns {Promise<Object|null>} Populated application document or null
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
   * 3. Compute platform-wide application metrics via MongoDB Aggregation Pipeline.
   *
   * @param {Object} [filter={}] - Filter criteria (status, company, job, dateFrom, dateTo)
   * @returns {Promise<Object>} Raw aggregation metrics
   */
  async getApplicationStatistics(filter = {}) {
    const matchStage = { ...filter };

    // Format date filter
    if (filter.appliedAt) {
      matchStage.appliedAt = filter.appliedAt;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $facet: {
          // Total count
          totalCount: [{ $count: 'total' }],

          // Group by status
          statusBreakdown: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],

          // Top companies by application count
          topCompanies: [
            { $group: { _id: '$company', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: 'companies',
                localField: '_id',
                foreignField: '_id',
                as: 'companyDetails',
              },
            },
            { $unwind: { path: '$companyDetails', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                count: 1,
                companyName: '$companyDetails.companyName',
                companyLogo: '$companyDetails.companyLogo',
              },
            },
          ],

          // Top jobs by application count
          topJobs: [
            { $group: { _id: '$job', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: 'jobs',
                localField: '_id',
                foreignField: '_id',
                as: 'jobDetails',
              },
            },
            { $unwind: { path: '$jobDetails', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                count: 1,
                title: '$jobDetails.title',
                company: '$jobDetails.company',
              },
            },
          ],

          // Recent 5 applications
          recentApplications: [
            { $sort: { appliedAt: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
              },
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'jobs',
                localField: 'job',
                foreignField: '_id',
                as: 'job',
              },
            },
            { $unwind: { path: '$job', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'companies',
                localField: 'company',
                foreignField: '_id',
                as: 'company',
              },
            },
            { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                status: 1,
                appliedAt: 1,
                candidateName: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
                candidateEmail: '$user.email',
                jobTitle: '$job.title',
                companyName: '$company.companyName',
              },
            },
          ],
        },
      },
    ];

    const [results] = await Application.aggregate(pipeline);

    const total = results?.totalCount[0]?.total || 0;
    const statusBreakdown = results?.statusBreakdown || [];
    const topCompanies = results?.topCompanies || [];
    const topJobs = results?.topJobs || [];
    const recentApplications = results?.recentApplications || [];

    return {
      total,
      statusBreakdown,
      topCompanies,
      topJobs,
      recentApplications,
    };
  }
}

export const adminApplicationRepository = new AdminApplicationRepository();
export default adminApplicationRepository;
