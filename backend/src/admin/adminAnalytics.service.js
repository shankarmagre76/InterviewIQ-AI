import adminAnalyticsRepository from './adminAnalytics.repository.js';
import adminAiUsageService from './adminAiUsage.service.js';
import { APPLICATION_STATUSES } from '../application/application.model.js';

/**
 * Admin Analytics Service Layer
 * Formats analytics payloads, computes conversion percentages, and structures chart-friendly time-series data.
 * Contains ZERO database query logic.
 */
class AdminAnalyticsService {
  /**
   * Helper to format application conversion metrics safely
   */
  computeApplicationConversion(total, statusBreakdown = []) {
    const statusMap = {};
    APPLICATION_STATUSES.forEach((st) => {
      statusMap[st] = 0;
    });

    statusBreakdown.forEach((item) => {
      const sKey = item.status || item._id;
      if (sKey && statusMap[sKey] !== undefined) {
        statusMap[sKey] = item.count;
      }
    });

    const interviewCount =
      (statusMap['Interview Scheduled'] || 0) +
      (statusMap['Technical Round'] || 0) +
      (statusMap['HR Round'] || 0);
    const offeredCount = statusMap['Offered'] || 0;
    const rejectedCount = statusMap['Rejected'] || 0;

    const interviewConversionRatePercent = total > 0 ? Number(((interviewCount / total) * 100).toFixed(2)) : 0;
    const offerConversionRatePercent = total > 0 ? Number(((offeredCount / total) * 100).toFixed(2)) : 0;
    const rejectionRatePercent = total > 0 ? Number(((rejectedCount / total) * 100).toFixed(2)) : 0;

    return {
      totalApplications: total,
      interviewCount,
      offeredCount,
      rejectedCount,
      interviewConversionRatePercent,
      offerConversionRatePercent,
      rejectionRatePercent,
    };
  }

  /**
   * 1. Get Platform-Wide Dashboard Summary Payload (`GET /api/v1/admin/dashboard`).
   *
   * @returns {Promise<Object>} Summary KPIs across all core entities
   */
  async getDashboardOverview() {
    const summary = await adminAnalyticsRepository.getDashboardSummary();
    const appConversion = this.computeApplicationConversion(
      summary.applications.totalApplications,
      summary.applications.applicationStatusBreakdown
    );

    return {
      users: summary.users,
      resumes: summary.resumes,
      interviews: summary.interviews,
      jobs: summary.jobs,
      applications: {
        totalApplications: summary.applications.totalApplications,
        interviewConversionRatePercent: appConversion.interviewConversionRatePercent,
        offerConversionRatePercent: appConversion.offerConversionRatePercent,
        statusBreakdown: summary.applications.applicationStatusBreakdown,
      },
      roadmaps: summary.roadmaps,
      notifications: summary.notifications,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 2. Get User Analytics Payload (`GET /api/v1/admin/analytics/users`).
   *
   * @param {Object} queryParams - { days }
   * @returns {Promise<Object>} User growth trend and role breakdowns
   */
  async getUserAnalytics(queryParams = {}) {
    const days = Number(queryParams.days || 30);
    return await adminAnalyticsRepository.getUserAnalytics(days);
  }

  /**
   * 3. Get Job & Company Analytics Payload (`GET /api/v1/admin/analytics/jobs`).
   *
   * @returns {Promise<Object>} Company and job breakdown analytics
   */
  async getJobAnalytics() {
    return await adminAnalyticsRepository.getJobAnalytics();
  }

  /**
   * 4. Get Application Funnel Analytics Payload (`GET /api/v1/admin/analytics/applications`).
   *
   * @param {Object} queryParams - { company, job, dateFrom, dateTo }
   * @returns {Promise<Object>} Application volume, status distribution, conversion funnel
   */
  async getApplicationAnalytics(queryParams = {}) {
    const rawData = await adminAnalyticsRepository.getApplicationAnalytics(queryParams);
    const conversion = this.computeApplicationConversion(rawData.totalApplications, rawData.statusBreakdown);

    return {
      totalApplications: rawData.totalApplications,
      conversionMetrics: conversion,
      statusBreakdown: rawData.statusBreakdown,
      dailyVolumeTrend: rawData.dailyVolumeTrend,
    };
  }

  /**
   * 5. Get AI Consumption Analytics Payload (`GET /api/v1/admin/analytics/ai`).
   *
   * @param {Object} queryParams - { user, dateFrom, dateTo }
   * @returns {Promise<Object>} Overall AI usage analytics
   */
  async getAiAnalytics(queryParams = {}) {
    return await adminAiUsageService.getOverallAiUsage(queryParams);
  }
}

export const adminAnalyticsService = new AdminAnalyticsService();
export default adminAnalyticsService;
