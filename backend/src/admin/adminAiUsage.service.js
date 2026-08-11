import adminAiUsageRepository from './adminAiUsage.repository.js';
import User from '../models/User.js';

/**
 * Admin AI Usage Service Layer
 * Handles administrative AI telemetry reporting, formatting, and feature percentage breakdowns.
 * Contains ZERO database query operations.
 */
class AdminAiUsageService {
  /**
   * 1. Get Overall Platform AI Usage Summary.
   *
   * @param {Object} queryParams - { user, dateFrom, dateTo }
   * @returns {Promise<Object>} Aggregated AI metrics overview
   */
  async getOverallAiUsage(queryParams = {}) {
    const rawStats = await adminAiUsageRepository.getOverallAiUsageStats(queryParams);

    const total = rawStats.totalAiOperations || 0;

    // Feature Percentage Distribution
    const resumePercent = total > 0 ? Number(((rawStats.totalResumeAnalyses / total) * 100).toFixed(2)) : 0;
    const interviewPercent = total > 0 ? Number(((rawStats.totalInterviews / total) * 100).toFixed(2)) : 0;
    const roadmapPercent = total > 0 ? Number(((rawStats.totalRoadmaps / total) * 100).toFixed(2)) : 0;

    // Populate User Details for Top Users
    const userIds = rawStats.topAiUsers.map((u) => u.userId);
    const users = await User.find({ _id: { $in: userIds } })
      .select('firstName lastName email role')
      .lean();

    const userMap = {};
    users.forEach((u) => {
      userMap[String(u._id)] = u;
    });

    const topAiUsers = rawStats.topAiUsers.map((u) => {
      const userInfo = userMap[String(u.userId)] || {};
      return {
        user: {
          id: u.userId,
          name: `${userInfo.firstName || 'Unknown'} ${userInfo.lastName || 'User'}`.trim(),
          email: userInfo.email || '',
        },
        totalCount: u.totalCount,
        resumeCount: u.resumeCount,
        interviewCount: u.interviewCount,
        roadmapCount: u.roadmapCount,
      };
    });

    return {
      overview: {
        totalAiOperations: total,
        totalResumeAnalyses: rawStats.totalResumeAnalyses,
        totalInterviews: rawStats.totalInterviews,
        totalRoadmaps: rawStats.totalRoadmaps,
        featureDistribution: {
          resumeAnalysisPercent: resumePercent,
          interviewPercent: interviewPercent,
          roadmapPercent: roadmapPercent,
        },
      },
      topAiUsers,
      recentActivities: rawStats.recentActivities,
      failedOperationsNote:
        'The current system architecture persists successful AI artifacts (ResumeAnalysis, Interview, LearningRoadmap); unhandled Gemini API failure exceptions return 500 error responses and are not stored in database collections.',
    };
  }

  /**
   * 2. Get Resume Analysis Detailed AI Usage Analytics.
   *
   * @param {Object} queryParams
   * @returns {Promise<Object>}
   */
  async getResumeAnalysisUsage(queryParams = {}) {
    return await adminAiUsageRepository.getResumeAnalysisUsage(queryParams, queryParams);
  }

  /**
   * 3. Get AI Mock Interview Detailed Usage Analytics.
   *
   * @param {Object} queryParams
   * @returns {Promise<Object>}
   */
  async getInterviewUsage(queryParams = {}) {
    return await adminAiUsageRepository.getInterviewUsage(queryParams, queryParams);
  }

  /**
   * 4. Get Learning Roadmap Detailed Usage Analytics.
   *
   * @param {Object} queryParams
   * @returns {Promise<Object>}
   */
  async getRoadmapUsage(queryParams = {}) {
    return await adminAiUsageRepository.getRoadmapUsage(queryParams, queryParams);
  }
}

export const adminAiUsageService = new AdminAiUsageService();
export default adminAiUsageService;
