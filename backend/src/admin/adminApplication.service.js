import adminApplicationRepository from './adminApplication.repository.js';
import ApiError from '../utils/ApiError.js';
import mongoose from 'mongoose';
import { APPLICATION_STATUSES } from '../application/application.model.js';

/**
 * Admin Application Service Layer
 * Computes platform-wide application metrics, conversion ratios, and enforces query filters.
 * Contains ZERO raw database queries.
 */
class AdminApplicationService {
  /**
   * Helper to construct MongoDB filter object from query parameters
   */
  buildFilter(queryParams = {}) {
    const { status, company, job, dateFrom, dateTo } = queryParams;
    const filter = {};

    if (status && String(status).trim()) {
      filter.status = String(status).trim();
    }

    if (company && mongoose.Types.ObjectId.isValid(company)) {
      filter.company = new mongoose.Types.ObjectId(company);
    }

    if (job && mongoose.Types.ObjectId.isValid(job)) {
      filter.job = new mongoose.Types.ObjectId(job);
    }

    if (dateFrom || dateTo) {
      filter.appliedAt = {};
      if (dateFrom) {
        filter.appliedAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.appliedAt.$lte = new Date(dateTo);
      }
    }

    return filter;
  }

  /**
   * 1. Retrieve paginated list of applications with filters.
   *
   * @param {Object} queryParams - { page, limit, status, company, job, dateFrom, dateTo, sortBy, sortOrder }
   * @returns {Promise<Object>} Paginated application list payload
   */
  async listApplications(queryParams = {}) {
    const { page = 1, limit = 10, sortBy = 'appliedAt', sortOrder = 'desc' } = queryParams;
    const filter = this.buildFilter(queryParams);

    const actualSortOrder = String(sortOrder).toLowerCase() === 'asc' || sortOrder === '1' || sortOrder === 1 ? 1 : -1;
    const sort = { [sortBy]: actualSortOrder };

    return await adminApplicationRepository.listApplications(filter, {
      page: Number(page),
      limit: Number(limit),
      sort,
    });
  }

  /**
   * 2. Retrieve specific application details by ID.
   *
   * @param {string} applicationId
   * @returns {Promise<Object>} Populated application document (sanitized)
   */
  async getApplicationById(applicationId) {
    const application = await adminApplicationRepository.getApplicationById(applicationId);
    if (!application) {
      throw ApiError.notFound('Application profile not found');
    }
    return application;
  }

  /**
   * 3. Compute platform-wide application statistics and conversion metrics.
   *
   * @param {Object} queryParams - { status, company, job, dateFrom, dateTo }
   * @returns {Promise<Object>} Calculated metrics payload
   */
  async getApplicationStatistics(queryParams = {}) {
    const filter = this.buildFilter(queryParams);
    const rawStats = await adminApplicationRepository.getApplicationStatistics(filter);

    const total = rawStats.total || 0;

    // Build status breakdown map for all defined statuses
    const statusMap = {};
    APPLICATION_STATUSES.forEach((st) => {
      statusMap[st] = 0;
    });

    rawStats.statusBreakdown.forEach((item) => {
      if (item._id && statusMap[item._id] !== undefined) {
        statusMap[item._id] = item.count;
      }
    });

    // Compute status percentages safely
    const statusDistribution = Object.keys(statusMap).map((statusKey) => {
      const count = statusMap[statusKey];
      const percentage = total > 0 ? Number(((count / total) * 100).toFixed(2)) : 0;
      return {
        status: statusKey,
        count,
        percentage,
      };
    });

    // Conversion Metrics Breakdown
    const appliedCount = statusMap['Applied'] || 0;
    const underReviewCount = statusMap['Under Review'] || 0;
    const interviewCount =
      (statusMap['Interview Scheduled'] || 0) +
      (statusMap['Technical Round'] || 0) +
      (statusMap['HR Round'] || 0);
    const offeredCount = statusMap['Offered'] || 0;
    const rejectedCount = statusMap['Rejected'] || 0;
    const withdrawnCount = statusMap['Withdrawn'] || 0;

    const totalReviewed = total - appliedCount;

    const interviewRate = total > 0 ? Number(((interviewCount / total) * 100).toFixed(2)) : 0;
    const offerRate = total > 0 ? Number(((offeredCount / total) * 100).toFixed(2)) : 0;
    const rejectionRate = total > 0 ? Number(((rejectedCount / total) * 100).toFixed(2)) : 0;
    const offerToInterviewRatio =
      interviewCount > 0 ? Number(((offeredCount / interviewCount) * 100).toFixed(2)) : 0;

    return {
      totalApplications: total,
      conversionMetrics: {
        appliedCount,
        underReviewCount,
        interviewCount,
        offeredCount,
        rejectedCount,
        withdrawnCount,
        totalReviewed,
        interviewRatePercent: interviewRate,
        offerRatePercent: offerRate,
        rejectionRatePercent: rejectionRate,
        offerToInterviewRatioPercent: offerToInterviewRatio,
      },
      statusDistribution,
      topCompaniesByApplications: rawStats.topCompanies,
      topJobsByApplications: rawStats.topJobs,
      recentApplications: rawStats.recentApplications,
    };
  }
}

export const adminApplicationService = new AdminApplicationService();
export default adminApplicationService;
