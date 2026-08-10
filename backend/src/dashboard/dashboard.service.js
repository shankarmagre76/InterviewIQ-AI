import dashboardRepository from './dashboard.repository.js';

/**
 * Dashboard Service Layer
 * Executes business logic, calculates profile completion percentages, career readiness scores,
 * ATS metrics, application funnel conversions, dynamic recommendations, and response structures.
 */
class DashboardService {
  /**
   * Calculate candidate Profile Completion Percentage
   * @param {Object|null} profile
   * @returns {number} percentage between 0 and 100
   */
  calculateProfileCompletion(profile) {
    if (!profile) return 0;

    let score = 0;

    // Headline (15%)
    if (profile.headline && profile.headline.trim().length > 0) score += 15;

    // Bio (15%)
    if (profile.bio && profile.bio.trim().length > 0) score += 15;

    // Skills (20%)
    if (Array.isArray(profile.skills) && profile.skills.length > 0) score += 20;

    // Education (15%)
    if (Array.isArray(profile.education) && profile.education.length > 0) score += 15;

    // Experience (15%)
    if (Array.isArray(profile.experience) && profile.experience.length > 0) score += 15;

    // Social Links (10%)
    const social = profile.socialLinks || {};
    if (
      social.github ||
      social.linkedin ||
      social.portfolio ||
      social.leetcode ||
      social.hackerrank ||
      social.codechef
    ) {
      score += 10;
    }

    // Basic Details / Contact Info (10%)
    if (
      (profile.firstName || profile.lastName) &&
      (profile.phone || profile.currentLocation || profile.dateOfBirth)
    ) {
      score += 10;
    }

    return Math.min(100, score);
  }

  /**
   * Compute Career Readiness Composite Score and dynamic recommendations
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
    const resumeScore = resumeMetrics.latestAnalysis?.atsScore || 0;
    const interviewScore = interviewMetrics.averageScore || 0;

    let applicationScore = 40;
    if (applicationMetrics.total > 0) {
      applicationScore = Math.min(
        100,
        Math.round(
          50 +
            applicationMetrics.interviewConversionRate * 0.3 +
            applicationMetrics.offerConversionRate * 0.5
        )
      );
    }

    // Formula: (Resume * 35%) + (Interview * 35%) + (Profile * 15%) + (Application * 15%)
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

    if (!resumeMetrics.hasResume) {
      recommendations.push(
        'Upload your resume to receive AI ATS feedback and boost your career readiness score.'
      );
    } else if (resumeScore < 75) {
      recommendations.push(
        `Resubmit your resume with recommended technical keywords to increase your ATS score from ${resumeScore}% to >75%.`
      );
    }

    if (interviewMetrics.completed === 0) {
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
        'Fill out missing skills, education, or social links to bring profile completion to 100%.'
      );
    }

    if (applicationMetrics.total === 0) {
      recommendations.push(
        'Apply to open job postings to track application response rates and funnel performance.'
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
   * Get Main Dashboard Overview
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getMainDashboard(userId) {
    const [
      profileData,
      resumeMetrics,
      interviewMetrics,
      applicationMetrics,
      savedJobMetrics,
      recentActivitiesData,
    ] = await Promise.all([
      dashboardRepository.getProfileData(userId),
      dashboardRepository.getResumeMetrics(userId),
      dashboardRepository.getInterviewMetrics(userId),
      dashboardRepository.getApplicationMetrics(userId),
      dashboardRepository.getSavedJobMetrics(userId),
      dashboardRepository.getRecentActivities(userId, { limit: 5 }),
    ]);

    const completionPercentage = this.calculateProfileCompletion(profileData);
    const targetRole = profileData?.headline || 'Candidate';
    const skillsCount = Array.isArray(profileData?.skills)
      ? profileData.skills.length
      : 0;

    const latestATSScore = resumeMetrics.latestAnalysis?.atsScore || 0;
    const previousATSScore = resumeMetrics.previousAnalysis?.atsScore || 0;
    const scoreImprovement = latestATSScore - previousATSScore;

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
        hasResume: resumeMetrics.hasResume,
        latestATSScore,
        previousATSScore,
        scoreImprovement,
        analysisCount: resumeMetrics.analysisCount,
      },
      interviews: {
        total: interviewMetrics.total,
        completed: interviewMetrics.completed,
        averageScore: interviewMetrics.averageScore,
        bestScore: interviewMetrics.bestScore,
        latestScore: interviewMetrics.latestScore,
      },
      applications: {
        total: applicationMetrics.total,
        applied: applicationMetrics.applied,
        underReview: applicationMetrics.underReview,
        interview: applicationMetrics.interview,
        offered: applicationMetrics.offered,
        rejected: applicationMetrics.rejected,
        withdrawn: applicationMetrics.withdrawn,
        interviewConversionRate: applicationMetrics.interviewConversionRate,
        offerConversionRate: applicationMetrics.offerConversionRate,
      },
      savedJobs: {
        total: savedJobMetrics.total,
      },
      careerReadiness: {
        overallScore: careerReadiness.overallScore,
        resumeScore: careerReadiness.scoreBreakdown.resumeScore,
        interviewScore: careerReadiness.scoreBreakdown.interviewScore,
        profileScore: careerReadiness.scoreBreakdown.profileScore,
        applicationScore: careerReadiness.scoreBreakdown.applicationScore,
        recommendations: careerReadiness.recommendations,
      },
      recentActivity: recentActivitiesData.activities,
    };
  }

  /**
   * Get Resume Sub-Dashboard Data
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getResumeDashboard(userId) {
    const resumeMetrics = await dashboardRepository.getResumeMetrics(userId);
    const latestAnalysis = resumeMetrics.latestAnalysis;

    const latestATSScore = latestAnalysis?.atsScore || 0;
    const previousATSScore = resumeMetrics.previousAnalysis?.atsScore || 0;
    const scoreImprovement = latestATSScore - previousATSScore;

    return {
      hasResume: resumeMetrics.hasResume,
      currentResume: resumeMetrics.activeResume
        ? {
            id: resumeMetrics.activeResume._id,
            originalName: resumeMetrics.activeResume.originalName,
            url: resumeMetrics.activeResume.url,
            uploadedAt: resumeMetrics.activeResume.uploadedAt,
          }
        : null,
      atsMetrics: {
        latestATSScore,
        previousATSScore,
        scoreImprovement,
        analysisCount: resumeMetrics.analysisCount,
      },
      scoreHistory: resumeMetrics.scoreHistory,
      latestAnalysisBreakdown: latestAnalysis
        ? {
            summary: latestAnalysis.summary || '',
            strengths: latestAnalysis.strengths || [],
            weaknesses: latestAnalysis.weaknesses || [],
            missingSkills: latestAnalysis.missingSkills || [],
            recommendedSkills: latestAnalysis.recommendedSkills || [],
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
   * Get Interviews Sub-Dashboard Data
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getInterviewDashboard(userId) {
    const metrics = await dashboardRepository.getInterviewMetrics(userId);
    return {
      summary: {
        total: metrics.total,
        completed: metrics.completed,
        inProgress: metrics.inProgress,
        pending: metrics.pending,
        averageScore: metrics.averageScore,
        bestScore: metrics.bestScore,
        latestScore: metrics.latestScore,
      },
      scoreDistribution: metrics.scoreDistribution,
      byType: metrics.byType,
      recentInterviews: metrics.recentInterviews,
    };
  }

  /**
   * Get Applications Sub-Dashboard Data
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getApplicationDashboard(userId) {
    const metrics = await dashboardRepository.getApplicationMetrics(userId);
    const { total, recentApplications, ...summary } = metrics;

    const statusFunnel = [
      { stage: 'Applied', count: summary.applied, percentage: 100 },
      { stage: 'Under Review', count: summary.underReview, percentage: total > 0 ? parseFloat(((summary.underReview / total) * 100).toFixed(1)) : 0 },
      { stage: 'Interview', count: summary.interview, percentage: summary.interviewConversionRate },
      { stage: 'Offered', count: summary.offered, percentage: summary.offerConversionRate },
    ];

    return {
      summary: {
        total,
        ...summary,
      },
      statusFunnel,
      recentApplications,
    };
  }

  /**
   * Get Career Readiness Sub-Dashboard Data
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getCareerReadinessDashboard(userId) {
    const [profileData, resumeMetrics, interviewMetrics, applicationMetrics] =
      await Promise.all([
        dashboardRepository.getProfileData(userId),
        dashboardRepository.getResumeMetrics(userId),
        dashboardRepository.getInterviewMetrics(userId),
        dashboardRepository.getApplicationMetrics(userId),
      ]);

    const profileScore = this.calculateProfileCompletion(profileData);
    return this.calculateCareerReadiness(
      profileScore,
      resumeMetrics,
      interviewMetrics,
      applicationMetrics
    );
  }

  /**
   * Get Recent Activity Stream Sub-Endpoint
   * @param {string} userId
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async getActivityStream(userId, options) {
    return await dashboardRepository.getRecentActivities(userId, options);
  }
}

export default new DashboardService();
