import User from '../models/User.js';
import Resume from '../resume/resume.model.js';
import ResumeAnalysis from '../resume/resumeAnalysis.model.js';
import Interview from '../interview/interview.model.js';
import InterviewResult from '../interview/interviewResult.model.js';
import Company from '../company/company.model.js';
import Job from '../job/job.model.js';
import Application from '../application/application.model.js';
import LearningRoadmap from '../learningRoadmap/learningRoadmap.model.js';
import Notification from '../notification/notification.model.js';
import mongoose from 'mongoose';

/**
 * Admin Analytics Repository Layer
 * Executes MongoDB database aggregations across all platform collections for high-performance reporting.
 * Contains ZERO business calculations.
 */
class AdminAnalyticsRepository {
  /**
   * 1. Get Dashboard Summary KPIs Across All Entities.
   *
   * @returns {Promise<Object>} Summary metrics across Users, Resumes, Interviews, Jobs, Applications, Roadmaps, Notifications
   */
  async getDashboardSummary() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      newUsersLast30Days,
      userRoleBreakdown,
      totalResumes,
      totalResumeAnalyses,
      atsScoreStats,
      totalInterviews,
      completedInterviews,
      interviewScoreStats,
      totalCompanies,
      activelyHiringCompanies,
      totalJobs,
      activeJobs,
      totalApplications,
      applicationStatusBreakdown,
      totalRoadmaps,
      activeRoadmaps,
      completedRoadmaps,
      totalNotifications,
      readNotifications,
      unreadNotifications,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Resume.countDocuments(),
      ResumeAnalysis.countDocuments(),
      ResumeAnalysis.aggregate([{ $group: { _id: null, avgScore: { $avg: '$atsScore' } } }]),
      Interview.countDocuments(),
      Interview.countDocuments({ status: 'Completed' }),
      InterviewResult.aggregate([{ $group: { _id: null, avgScore: { $avg: '$overallScore' } } }]),
      Company.countDocuments(),
      Company.countDocuments({ hiringStatus: 'Actively Hiring' }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'Active' }),
      Application.countDocuments(),
      Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      LearningRoadmap.countDocuments(),
      LearningRoadmap.countDocuments({ status: 'ACTIVE' }),
      LearningRoadmap.countDocuments({ status: 'COMPLETED' }),
      Notification.countDocuments(),
      Notification.countDocuments({ isRead: true }),
      Notification.countDocuments({ isRead: false }),
    ]);

    return {
      users: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        newUsersLast30Days,
        userRoleBreakdown,
      },
      resumes: {
        totalResumes,
        totalResumeAnalyses,
        avgAtsScore: Math.round((atsScoreStats[0]?.avgScore || 0) * 100) / 100,
      },
      interviews: {
        totalInterviews,
        completedInterviews,
        avgInterviewScore: Math.round((interviewScoreStats[0]?.avgScore || 0) * 100) / 100,
      },
      jobs: {
        totalCompanies,
        activelyHiringCompanies,
        totalJobs,
        activeJobs,
      },
      applications: {
        totalApplications,
        applicationStatusBreakdown,
      },
      roadmaps: {
        totalRoadmaps,
        activeRoadmaps,
        completedRoadmaps,
      },
      notifications: {
        totalNotifications,
        readNotifications,
        unreadNotifications,
      },
    };
  }

  /**
   * 2. Get User Registration & Growth Time-Series Analytics.
   *
   * @param {number} [days=30] - Number of days to look back
   * @returns {Promise<Object>} Time-series registration trend and user breakdown
   */
  async getUserAnalytics(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalUsers, activeUsers, inactiveUsers, roleBreakdown, dailyGrowth] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      roleBreakdown: roleBreakdown.map((r) => ({ role: r._id, count: r.count })),
      dailyGrowth: dailyGrowth.map((g) => ({ date: g._id, count: g.count })),
    };
  }

  /**
   * 3. Get Job & Company Analytics.
   *
   * @returns {Promise<Object>} Detailed breakdown of companies, jobs, workModes, employmentTypes
   */
  async getJobAnalytics() {
    const [
      totalCompanies,
      companyStatusBreakdown,
      totalJobs,
      jobStatusBreakdown,
      workModeBreakdown,
      employmentTypeBreakdown,
      dailyPostingsTrend,
    ] = await Promise.all([
      Company.countDocuments(),
      Company.aggregate([{ $group: { _id: '$hiringStatus', count: { $sum: 1 } } }]),
      Job.countDocuments(),
      Job.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Job.aggregate([{ $group: { _id: '$workMode', count: { $sum: 1 } } }]),
      Job.aggregate([{ $group: { _id: '$employmentType', count: { $sum: 1 } } }]),
      Job.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 30 },
      ]),
    ]);

    return {
      companies: {
        totalCompanies,
        statusBreakdown: companyStatusBreakdown.map((b) => ({ status: b._id, count: b.count })),
      },
      jobs: {
        totalJobs,
        statusBreakdown: jobStatusBreakdown.map((b) => ({ status: b._id, count: b.count })),
        workModeBreakdown: workModeBreakdown.map((b) => ({ workMode: b._id, count: b.count })),
        employmentTypeBreakdown: employmentTypeBreakdown.map((b) => ({ employmentType: b._id, count: b.count })),
        dailyPostingsTrend: dailyPostingsTrend.map((g) => ({ date: g._id, count: g.count })),
      },
    };
  }

  /**
   * 4. Get Application Funnel & Volume Analytics.
   *
   * @param {Object} [filter={}]
   * @returns {Promise<Object>} Status distribution, top volume companies/jobs, and volume time-series
   */
  async getApplicationAnalytics(filter = {}) {
    const matchStage = {};
    if (filter.company && mongoose.Types.ObjectId.isValid(filter.company)) {
      matchStage.company = new mongoose.Types.ObjectId(filter.company);
    }
    if (filter.job && mongoose.Types.ObjectId.isValid(filter.job)) {
      matchStage.job = new mongoose.Types.ObjectId(filter.job);
    }
    if (filter.dateFrom || filter.dateTo) {
      matchStage.appliedAt = {};
      if (filter.dateFrom) matchStage.appliedAt.$gte = new Date(filter.dateFrom);
      if (filter.dateTo) matchStage.appliedAt.$lte = new Date(filter.dateTo);
    }

    const [totalApplications, statusBreakdown, dailyVolumeTrend] = await Promise.all([
      Application.countDocuments(matchStage),
      Application.aggregate([
        { $match: matchStage },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Application.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 30 },
      ]),
    ]);

    return {
      totalApplications,
      statusBreakdown: statusBreakdown.map((b) => ({ status: b._id, count: b.count })),
      dailyVolumeTrend: dailyVolumeTrend.map((g) => ({ date: g._id, count: g.count })),
    };
  }
}

export const adminAnalyticsRepository = new AdminAnalyticsRepository();
export default adminAnalyticsRepository;
