import ResumeAnalysis from '../resume/resumeAnalysis.model.js';
import Interview from '../interview/interview.model.js';
import LearningRoadmap from '../learningRoadmap/learningRoadmap.model.js';
import mongoose from 'mongoose';

/**
 * Admin AI Usage Repository Layer
 * Performs database queries and MongoDB aggregations across ResumeAnalysis, Interview, and LearningRoadmap collections.
 * Contains ZERO business logic.
 */
class AdminAiUsageRepository {
  /**
   * Helper to build date range filter on createdAt
   */
  buildDateFilter(dateFrom, dateTo) {
    if (!dateFrom && !dateTo) return {};
    const filter = {};
    if (dateFrom) filter.$gte = new Date(dateFrom);
    if (dateTo) filter.$lte = new Date(dateTo);
    return { createdAt: filter };
  }

  /**
   * 1. Get Overall AI Usage Summary Across All 3 Features.
   *
   * @param {Object} [filter={}] - Filter criteria ({ user, dateFrom, dateTo })
   * @returns {Promise<Object>} Aggregated overall AI usage numbers
   */
  async getOverallAiUsageStats(filter = {}) {
    const { user, dateFrom, dateTo } = filter;
    const dateMatch = this.buildDateFilter(dateFrom, dateTo);

    const matchQuery = { ...dateMatch };
    if (user && mongoose.Types.ObjectId.isValid(user)) {
      matchQuery.user = new mongoose.Types.ObjectId(user);
    }

    const [totalResumeAnalyses, totalInterviews, totalRoadmaps] = await Promise.all([
      ResumeAnalysis.countDocuments(matchQuery),
      Interview.countDocuments(matchQuery),
      LearningRoadmap.countDocuments(matchQuery),
    ]);

    const totalAiOperations = totalResumeAnalyses + totalInterviews + totalRoadmaps;

    // Top AI Usage by User (Aggregation across collections)
    const userAggPipeline = (Model) => [
      { $match: matchQuery },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ];

    const [resumeUserCounts, interviewUserCounts, roadmapUserCounts] = await Promise.all([
      ResumeAnalysis.aggregate(userAggPipeline(ResumeAnalysis)),
      Interview.aggregate(userAggPipeline(Interview)),
      LearningRoadmap.aggregate(userAggPipeline(LearningRoadmap)),
    ]);

    const userUsageMap = {};
    const combineUserCounts = (list, type) => {
      list.forEach((item) => {
        if (!item._id) return;
        const uid = String(item._id);
        if (!userUsageMap[uid]) {
          userUsageMap[uid] = { userId: item._id, totalCount: 0, resumeCount: 0, interviewCount: 0, roadmapCount: 0 };
        }
        userUsageMap[uid][`${type}Count`] += item.count;
        userUsageMap[uid].totalCount += item.count;
      });
    };

    combineUserCounts(resumeUserCounts, 'resume');
    combineUserCounts(interviewUserCounts, 'interview');
    combineUserCounts(roadmapUserCounts, 'roadmap');

    const sortedUsers = Object.values(userUsageMap)
      .sort((a, b) => b.totalCount - a.totalCount)
      .slice(0, 10);

    // Recent 10 Combined AI Operations
    const [recentResumes, recentInterviews, recentRoadmaps] = await Promise.all([
      ResumeAnalysis.find(matchQuery)
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'firstName lastName email')
        .lean(),
      Interview.find(matchQuery)
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'firstName lastName email')
        .lean(),
      LearningRoadmap.find(matchQuery)
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'firstName lastName email')
        .lean(),
    ]);

    const recentActivities = [
      ...recentResumes.map((r) => ({
        _id: r._id,
        feature: 'Resume Analysis',
        user: r.user,
        details: `ATS Score: ${r.atsScore}`,
        createdAt: r.createdAt,
      })),
      ...recentInterviews.map((i) => ({
        _id: i._id,
        feature: 'AI Mock Interview',
        user: i.user,
        details: `${i.type} Interview (${i.role})`,
        createdAt: i.createdAt,
      })),
      ...recentRoadmaps.map((rm) => ({
        _id: rm._id,
        feature: 'Learning Roadmap',
        user: rm.user,
        details: `Roadmap for ${rm.targetRole}`,
        createdAt: rm.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    return {
      totalAiOperations,
      totalResumeAnalyses,
      totalInterviews,
      totalRoadmaps,
      topAiUsers: sortedUsers,
      recentActivities,
    };
  }

  /**
   * 2. Get Resume Analysis Usage Statistics & Paginated List.
   *
   * @param {Object} [filter={}]
   * @param {Object} [options={}]
   * @returns {Promise<Object>} Resume analysis AI metrics and records list
   */
  async getResumeAnalysisUsage(filter = {}, options = {}) {
    const page = Math.max(1, parseInt(options.page || 1, 10));
    const limit = Math.max(1, parseInt(options.limit || 10, 10));
    const skip = (page - 1) * limit;

    const matchQuery = {};
    if (filter.user && mongoose.Types.ObjectId.isValid(filter.user)) {
      matchQuery.user = new mongoose.Types.ObjectId(filter.user);
    }
    const dateMatch = this.buildDateFilter(filter.dateFrom, filter.dateTo);
    Object.assign(matchQuery, dateMatch);

    const [items, total, stats] = await Promise.all([
      ResumeAnalysis.find(matchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'firstName lastName email')
        .populate('resume', 'originalName url')
        .select('-rawAnalysisResponse')
        .lean(),
      ResumeAnalysis.countDocuments(matchQuery),
      ResumeAnalysis.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            avgAtsScore: { $avg: '$atsScore' },
            totalPromptTokens: { $sum: '$tokenUsage.promptTokens' },
            totalCompletionTokens: { $sum: '$tokenUsage.completionTokens' },
            totalTokens: { $sum: '$tokenUsage.totalTokens' },
          },
        },
      ]),
    ]);

    const statResult = stats[0] || {
      avgAtsScore: 0,
      totalPromptTokens: 0,
      totalCompletionTokens: 0,
      totalTokens: 0,
    };

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      avgAtsScore: Math.round((statResult.avgAtsScore || 0) * 100) / 100,
      tokenUsage: {
        promptTokens: statResult.totalPromptTokens || 0,
        completionTokens: statResult.totalCompletionTokens || 0,
        totalTokens: statResult.totalTokens || 0,
      },
    };
  }

  /**
   * 3. Get AI Mock Interview Usage Statistics & Paginated List.
   *
   * @param {Object} [filter={}]
   * @param {Object} [options={}]
   * @returns {Promise<Object>} Interview AI metrics and records list
   */
  async getInterviewUsage(filter = {}, options = {}) {
    const page = Math.max(1, parseInt(options.page || 1, 10));
    const limit = Math.max(1, parseInt(options.limit || 10, 10));
    const skip = (page - 1) * limit;

    const matchQuery = {};
    if (filter.user && mongoose.Types.ObjectId.isValid(filter.user)) {
      matchQuery.user = new mongoose.Types.ObjectId(filter.user);
    }
    if (filter.status) matchQuery.status = filter.status;
    if (filter.type) matchQuery.type = filter.type;
    if (filter.difficulty) matchQuery.difficulty = filter.difficulty;

    const dateMatch = this.buildDateFilter(filter.dateFrom, filter.dateTo);
    Object.assign(matchQuery, dateMatch);

    const [items, total, statusBreakdown, difficultyBreakdown, typeBreakdown] = await Promise.all([
      Interview.find(matchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'firstName lastName email')
        .populate('company', 'companyName companyLogo')
        .lean(),
      Interview.countDocuments(matchQuery),
      Interview.aggregate([
        { $match: matchQuery },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Interview.aggregate([
        { $match: matchQuery },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      ]),
      Interview.aggregate([
        { $match: matchQuery },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      statusBreakdown: statusBreakdown.map((b) => ({ status: b._id, count: b.count })),
      difficultyBreakdown: difficultyBreakdown.map((b) => ({ difficulty: b._id, count: b.count })),
      typeBreakdown: typeBreakdown.map((b) => ({ type: b._id, count: b.count })),
    };
  }

  /**
   * 4. Get Learning Roadmap Usage Statistics & Paginated List.
   *
   * @param {Object} [filter={}]
   * @param {Object} [options={}]
   * @returns {Promise<Object>} Learning roadmap AI metrics and records list
   */
  async getRoadmapUsage(filter = {}, options = {}) {
    const page = Math.max(1, parseInt(options.page || 1, 10));
    const limit = Math.max(1, parseInt(options.limit || 10, 10));
    const skip = (page - 1) * limit;

    const matchQuery = {};
    if (filter.user && mongoose.Types.ObjectId.isValid(filter.user)) {
      matchQuery.user = new mongoose.Types.ObjectId(filter.user);
    }
    if (filter.status) matchQuery.status = filter.status;
    if (filter.targetRole) matchQuery.targetRole = new RegExp(filter.targetRole.trim(), 'i');

    const dateMatch = this.buildDateFilter(filter.dateFrom, filter.dateTo);
    Object.assign(matchQuery, dateMatch);

    const [items, total, statusBreakdown, topTargetRoles] = await Promise.all([
      LearningRoadmap.find(matchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'firstName lastName email')
        .lean(),
      LearningRoadmap.countDocuments(matchQuery),
      LearningRoadmap.aggregate([
        { $match: matchQuery },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      LearningRoadmap.aggregate([
        { $match: matchQuery },
        { $group: { _id: '$targetRole', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      statusBreakdown: statusBreakdown.map((b) => ({ status: b._id, count: b.count })),
      topTargetRoles: topTargetRoles.map((r) => ({ targetRole: r._id, count: r.count })),
    };
  }
}

export const adminAiUsageRepository = new AdminAiUsageRepository();
export default adminAiUsageRepository;
