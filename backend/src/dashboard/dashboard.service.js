import dashboardRepository from './dashboard.repository.js';

/**
 * Dashboard Service Layer
 * Orchestrates metrics calculation, data aggregation across domain repositories,
 * normalization of zero/empty candidate data, and career readiness scoring.
 *
 * Contains ZERO direct database queries. Relies exclusively on DashboardRepository.
 */
class DashboardService {
  /**
   * Calculate candidate Profile Completion Percentage (0 - 100%)
   * @param {Object|null} profileStats
   * @returns {number} Integer completion percentage
   */
  calculateProfileCompletion(profileStats) {
    if (!profileStats || !profileStats.hasProfile) return 0;

    let score = 0;

    // Headline (15%)
    if (profileStats.headline && profileStats.headline.trim().length > 0) score += 15;

    // Bio (15%)
    if (profileStats.bio && profileStats.bio.trim().length > 0) score += 15;

    // Skills (20%)
    if (profileStats.skillsCount && profileStats.skillsCount > 0) score += 20;

    // Education (15%)
    if (profileStats.educationCount && profileStats.educationCount > 0) score += 15;

    // Experience (15%)
    if (profileStats.experienceCount && profileStats.experienceCount > 0) score += 15;

    // Social Links (10%)
    if (profileStats.hasSocialLinks) score += 10;

    // Basic Info / Contact Info (10%)
    if (profileStats.hasBasicInfo) score += 10;

    return Math.min(100, score);
  }

  /**
   * Compute Career Readiness Composite Evaluation Score and dynamic recommendations.
   *
   * Formula:
   * overallScore = (resumeScore * 0.35) + (interviewScore * 0.35) + (profileScore * 0.15) + (applicationScore * 0.15)
   *
   * @param {number} profileScore
   * @param {Object} resumeMetrics
   * @param {Object} interviewMetrics
   * @param {Object} applicationMetrics
   * @returns {Object}
   */
  calculateCareerReadiness(
    profileScore,
    resumeMetrics,
    interviewMetrics,
    applicationMetrics
  ) {
    const resumeScore = resumeMetrics?.latestATSScore || 0;
    const interviewScore = interviewMetrics?.averageScore || 0;

    let applicationScore = 40;
    if (applicationMetrics && applicationMetrics.total > 0) {
      applicationScore = Math.min(
        100,
        Math.round(
          50 +
            (applicationMetrics.interviewConversionRate || 0) * 0.3 +
            (applicationMetrics.offerConversionRate || 0) * 0.5
        )
      );
    }

    const overallScore = Math.round(
      resumeScore * 0.35 +
        interviewScore * 0.35 +
        profileScore * 0.15 +
        applicationScore * 0.15
    );

    let readinessLevel = 'Needs Improvement';
    if (overallScore >= 85) readinessLevel = 'Job Ready (Exceptional)';
    else if (overallScore >= 70) readinessLevel = 'Job Ready';
    else if (overallScore >= 55) readinessLevel = 'Moderately Prepared';

    const recommendations = [];

    if (!resumeMetrics || !resumeMetrics.hasResume) {
      recommendations.push(
        'Upload your resume to receive AI ATS feedback and boost your career readiness score.'
      );
    } else if (resumeScore < 75) {
      recommendations.push(
        `Resubmit your resume with recommended technical keywords to increase your ATS score from ${resumeScore}% to >75%.`
      );
    }

    if (!interviewMetrics || interviewMetrics.completed === 0) {
      recommendations.push(
        'Complete your first AI Mock Interview session to establish your technical interview score.'
      );
    } else if (interviewScore < 75) {
      recommendations.push(
        `Practice additional technical and behavioral interview sessions to raise your average score from ${interviewScore} to >75.`
      );
    }

    if (profileScore < 100) {
      recommendations.push(
        'Fill out missing skills, education, or social links to bring candidate profile completion to 100%.'
      );
    }

    if (!applicationMetrics || applicationMetrics.total === 0) {
      recommendations.push(
        'Apply to active job postings to track application response rates and funnel performance.'
      );
    }

    return {
      overallScore,
      readinessLevel,
      scoreBreakdown: {
        resumeScore,
        interviewScore,
        profileScore,
        applicationScore,
      },
      formulaWeights: {
        resumeScore: 0.35,
        interviewScore: 0.35,
        profileScore: 0.15,
        applicationScore: 0.15,
      },
      benchmarks: {
        industryAverage: 72,
        targetScore: 85,
      },
      recommendations,
    };
  }

  /**
   * Get Main Dashboard Summary Overview
   * Combines profile, resume, interview, application, saved jobs, career readiness, and recent activity.
   * Handles users with zero records gracefully.
   *
   * @param {string} userId
   * @returns {Promise<Object>} Main dashboard response structure
   */
  async getDashboard(userId) {
    const [
      profileStats,
      resumeMetrics,
      interviewMetrics,
      applicationMetrics,
      savedJobMetrics,
      recentActivitiesData,
    ] = await Promise.all([
      dashboardRepository.getProfileStats(userId),
      dashboardRepository.getResumeStats(userId),
      dashboardRepository.getInterviewStats(userId),
      dashboardRepository.getApplicationStats(userId),
      dashboardRepository.getSavedJobStats(userId),
      dashboardRepository.getRecentActivity(userId, { limit: 5 }),
    ]);

    const completionPercentage = this.calculateProfileCompletion(profileStats);
    const targetRole = profileStats?.headline || 'Candidate';
    const skillsCount = profileStats?.skillsCount || 0;

    const careerReadiness = this.calculateCareerReadiness(
      completionPercentage,
      resumeMetrics,
      interviewMetrics,
      applicationMetrics
    );

    return {
      profile: {
        completionPercentage,
        targetRole,
        skillsCount,
      },
      resume: {
        hasResume: resumeMetrics?.hasResume || false,
        latestATSScore: resumeMetrics?.latestATSScore || 0,
        previousATSScore: resumeMetrics?.previousATSScore || 0,
        scoreImprovement: resumeMetrics?.scoreImprovement || 0,
        analysisCount: resumeMetrics?.analysisCount || 0,
      },
      interviews: {
        total: interviewMetrics?.total || 0,
        completed: interviewMetrics?.completed || 0,
        averageScore: interviewMetrics?.averageScore || 0,
        bestScore: interviewMetrics?.bestScore || 0,
        latestScore: interviewMetrics?.latestScore || 0,
      },
      applications: {
        total: applicationMetrics?.total || 0,
        applied: applicationMetrics?.applied || 0,
        underReview: applicationMetrics?.underReview || 0,
        interview: applicationMetrics?.interview || 0,
        offered: applicationMetrics?.offered || 0,
        rejected: applicationMetrics?.rejected || 0,
        withdrawn: applicationMetrics?.withdrawn || 0,
        interviewConversionRate: applicationMetrics?.interviewConversionRate || 0,
        offerConversionRate: applicationMetrics?.offerConversionRate || 0,
      },
      savedJobs: {
        total: savedJobMetrics?.total || 0,
      },
      careerReadiness: {
        overallScore: careerReadiness.overallScore,
        resumeScore: careerReadiness.scoreBreakdown.resumeScore,
        interviewScore: careerReadiness.scoreBreakdown.interviewScore,
        profileScore: careerReadiness.scoreBreakdown.profileScore,
        applicationScore: careerReadiness.scoreBreakdown.applicationScore,
        recommendations: careerReadiness.recommendations,
      },
      recentActivity: recentActivitiesData?.activities || [],
    };
  }

  /**
   * Alias method for getDashboard to support existing calls
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getMainDashboard(userId) {
    return await this.getDashboard(userId);
  }

  /**
   * Get Detailed Resume Sub-Dashboard Data
  /**
   * Calculate Phase 8.4 Resume Analytics metrics.
   * Returns currentScore, previousScore, improvement, highestScore, lowestScore, analysisCount,
   * latestAnalysisDate, scoreHistory (time-series), missingSkills, recommendedSkills, hasResume, resumeStatus.
   *
   * @param {string} userId
   * @returns {Promise<Object>} Time-series analytics payload for frontend charts
   */
  async getResumeAnalytics(userId) {
    const rawData = await dashboardRepository.getResumeAnalyticsData(userId);

    const activeResume = rawData.activeResume;
    const statsGroup = rawData.aggregateResult.stats?.[0] || {
      count: 0,
      highestScore: 0,
      lowestScore: 0,
    };

    const latestTwo = rawData.aggregateResult.latestTwo || [];
    const latestAnalysis = latestTwo[0] || null;
    const previousAnalysis = latestTwo[1] || null;

    const currentScore = latestAnalysis ? latestAnalysis.atsScore : 0;
    const previousScore = previousAnalysis ? previousAnalysis.atsScore : 0;
    const improvement = latestAnalysis ? currentScore - previousScore : 0;
    const highestScore = statsGroup.highestScore || 0;
    const lowestScore = statsGroup.lowestScore || 0;
    const analysisCount = statsGroup.count || 0;
    const latestAnalysisDate = latestAnalysis
      ? latestAnalysis.analyzedAt || latestAnalysis.createdAt
      : null;

    const scoreHistory = rawData.chronologicalHistory.map((item) => ({
      score: item.score,
      date: item.date,
      analysisId: item.analysisId,
      aiProvider: item.aiProvider,
    }));

    const missingSkills = latestAnalysis?.missingSkills || [];
    const recommendedSkills = latestAnalysis?.recommendedSkills || [];
    const hasResume = !!activeResume || analysisCount > 0;
    const resumeStatus = activeResume
      ? activeResume.isActive
        ? 'active'
        : 'inactive'
      : 'none';

    return {
      currentScore,
      previousScore,
      improvement,
      highestScore,
      lowestScore,
      analysisCount,
      latestAnalysisDate,
      scoreHistory,
      missingSkills,
      recommendedSkills,
      hasResume,
      resumeStatus,
      currentResume: activeResume
        ? {
            id: activeResume._id,
            originalName: activeResume.originalName,
            url: activeResume.url,
            uploadedAt: activeResume.uploadedAt,
          }
        : null,
      latestAnalysisBreakdown: latestAnalysis
        ? {
            summary: latestAnalysis.summary || '',
            strengths: latestAnalysis.strengths || [],
            weaknesses: latestAnalysis.weaknesses || [],
            sectionScores: {
              summary: latestAnalysis.sectionFeedback?.summary?.score || 0,
              experience: latestAnalysis.sectionFeedback?.experience?.score || 0,
              education: latestAnalysis.sectionFeedback?.education?.score || 0,
              skills: latestAnalysis.sectionFeedback?.skills?.score || 0,
              projects: latestAnalysis.sectionFeedback?.projects?.score || 0,
            },
          }
        : null,
    };
  }

  /**
   * Get Detailed Resume Sub-Dashboard Data (Alias / wrapper for getResumeAnalytics)
   * @param {string} userId
   * @returns {Promise<Object>} Resume sub-dashboard payload
   */
  async getResumeDashboard(userId) {
    return await this.getResumeAnalytics(userId);
  }

  /**
   * Get Detailed Interviews Sub-Dashboard Data
   * @param {string} userId
   * @returns {Promise<Object>} Interview sub-dashboard payload
   */
  async getInterviewDashboard(userId) {
    const [metrics, scoreHistory] = await Promise.all([
      dashboardRepository.getInterviewStats(userId),
      dashboardRepository.getInterviewScoreHistory(userId),
    ]);

    return {
      summary: {
        total: metrics.total,
        completed: metrics.completed,
        inProgress: metrics.inProgress,
        pending: metrics.pending,
        cancelled: metrics.cancelled,
        averageScore: metrics.averageScore,
        bestScore: metrics.bestScore,
        latestScore: metrics.latestScore,
      },
      scoreDistribution: metrics.scoreDistribution,
      scoreHistory: scoreHistory || [],
      recentInterviews: metrics.recentInterviews || [],
    };
  }

  /**
   * Get Detailed Applications Sub-Dashboard Data
   * @param {string} userId
   * @returns {Promise<Object>} Application sub-dashboard payload
   */
  async getApplicationDashboard(userId) {
    const [statusStats, applicationMetrics] = await Promise.all([
      dashboardRepository.getApplicationStatusStats(userId),
      dashboardRepository.getApplicationStats(userId),
    ]);

    return {
      summary: {
        total: statusStats.total,
        ...statusStats.statusBreakdown,
        interviewConversionRate: statusStats.conversionRates.interviewConversionRate,
        offerConversionRate: statusStats.conversionRates.offerConversionRate,
      },
      statusFunnel: statusStats.funnelStages,
      conversionRates: statusStats.conversionRates,
      recentApplications: applicationMetrics.recentApplications || [],
    };
  }

  /**
   * Get Paginated Recent Candidate Activity Sub-Dashboard Data
   * @param {string} userId
   * @param {Object} [options={}] - { limit: 10, page: 1, type: null }
   * @returns {Promise<Object>} Activity feed payload
   */
  async getActivityDashboard(userId, options = {}) {
    return await dashboardRepository.getRecentActivity(userId, options);
  }

  /**
   * Alias method for getActivityDashboard to support router controller calls
   * @param {string} userId
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async getActivityStream(userId, options) {
    return await this.getActivityDashboard(userId, options);
  }

  /**
   * Get Standalone Career Readiness Sub-Dashboard Data
   * @param {string} userId
   * @returns {Promise<Object>} Career readiness payload
   */
  async getCareerReadinessDashboard(userId) {
    const [profileStats, resumeMetrics, interviewMetrics, applicationMetrics] =
      await Promise.all([
        dashboardRepository.getProfileStats(userId),
        dashboardRepository.getResumeStats(userId),
        dashboardRepository.getInterviewStats(userId),
        dashboardRepository.getApplicationStats(userId),
      ]);

    const profileScore = this.calculateProfileCompletion(profileStats);
    return this.calculateCareerReadiness(
      profileScore,
      resumeMetrics,
      interviewMetrics,
      applicationMetrics
    );
  }
}

export default new DashboardService();
export { DashboardService };
