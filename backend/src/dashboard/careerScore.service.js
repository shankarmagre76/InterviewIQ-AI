import dashboardRepository from './dashboard.repository.js';

/**
 * Career Score Service Layer
 * Computes a candidate's composite Career Readiness Score dynamically from existing data.
 *
 * Scoring Architecture:
 * Profile Completion:       15%
 * Resume ATS Score:         30%
 * Interview Performance:    30%
 * Application Activity:     10%
 * Skills / Profile Strength: 15%
 * Total Weight:            100%
 */
class CareerScoreService {
  /**
   * Component 1: Profile Completion Score (0-100)
   * Evaluates completion across headline, bio, skills, education, experience, social links, contact info.
   *
   * @param {Object|null} profileStats
   * @returns {number} 0 - 100
   */
  calculateProfileComponent(profileStats) {
    if (!profileStats || !profileStats.hasProfile) return 0;

    let score = 0;
    if (profileStats.headline && profileStats.headline.trim().length > 0) score += 15;
    if (profileStats.bio && profileStats.bio.trim().length > 0) score += 15;
    if (profileStats.skillsCount && profileStats.skillsCount > 0) score += 20;
    if (profileStats.educationCount && profileStats.educationCount > 0) score += 15;
    if (profileStats.experienceCount && profileStats.experienceCount > 0) score += 15;
    if (profileStats.hasSocialLinks) score += 10;
    if (profileStats.hasBasicInfo) score += 10;

    return Math.min(100, score);
  }

  /**
   * Component 2: Resume ATS Score (0-100)
   * Sourced directly from candidate's latest AI Resume Analysis.
   *
   * @param {Object|null} resumeMetrics
   * @returns {number} 0 - 100
   */
  calculateResumeComponent(resumeMetrics) {
    if (!resumeMetrics || !resumeMetrics.hasResume) return 0;
    return resumeMetrics.latestATSScore || 0;
  }

  /**
   * Component 3: Interview Performance Score (0-100)
   * Average overall score across completed mock interview evaluations.
   *
   * @param {Object|null} interviewMetrics
   * @returns {number} 0 - 100
   */
  calculateInterviewComponent(interviewMetrics) {
    if (!interviewMetrics || interviewMetrics.completed === 0) return 0;
    return interviewMetrics.averageScore || 0;
  }

  /**
   * Component 4: Application Activity Score (0-100)
   * Evaluates job search momentum and funnel progression.
   *
   * @param {Object|null} applicationMetrics
   * @returns {number} 0 - 100
   */
  calculateApplicationComponent(applicationMetrics) {
    if (!applicationMetrics || applicationMetrics.total === 0) return 0;

    const total = applicationMetrics.total;
    let score = 40; // Base score for taking initiative to apply

    if (total >= 10) score += 30;
    else if (total >= 5) score += 20;
    else if (total >= 1) score += 10;

    const interviewConversion = applicationMetrics.interviewConversionRate || 0;
    const offerConversion = applicationMetrics.offerConversionRate || 0;

    score += Math.round(interviewConversion * 0.2 + offerConversion * 0.1);

    return Math.min(100, score);
  }

  /**
   * Component 5: Skills & Profile Strength Score (0-100)
   * Evaluates skills array volume and proficiency levels.
   *
   * @param {Object|null} profileStats
   * @returns {number} 0 - 100
   */
  calculateSkillsComponent(profileStats) {
    if (!profileStats || !profileStats.hasProfile) return 0;

    const count = profileStats.skillsCount || 0;
    let score = 0;

    if (count >= 10) score = 90;
    else if (count >= 5) score = 80;
    else if (count >= 3) score = 60;
    else if (count >= 1) score = 40;

    // Bonus for completed education & experience background
    if (profileStats.educationCount > 0) score += 5;
    if (profileStats.experienceCount > 0) score += 5;

    return Math.min(100, score);
  }

  /**
   * Categorize candidate readiness level based on overall score.
   * @param {number} overallScore
   * @returns {string} Readiness level text
   */
  getReadinessLevel(overallScore) {
    if (overallScore >= 85) return 'Job Ready (Exceptional)';
    if (overallScore >= 70) return 'Job Ready';
    if (overallScore >= 55) return 'Moderately Prepared';
    return 'Needs Improvement';
  }

  /**
   * Generate targeted recommendations based on weakest scoring components.
   *
   * @param {Object} components - { profile, resume, interview, applications, skills }
   * @param {Object} context - Raw metrics objects for detailed diagnostic messages
   * @returns {Array<string>} Actionable recommendation strings
   */
  generateRecommendations(components, context) {
    const { profile, resume, interview, applications, skills } = components;
    const { resumeMetrics, interviewMetrics, applicationMetrics } = context;

    const recommendations = [];

    // 1. Resume Recommendations
    if (!resumeMetrics || !resumeMetrics.hasResume) {
      recommendations.push(
        'Upload your resume to receive an AI ATS analysis and baseline your ATS score.'
      );
    } else if (resume < 75) {
      recommendations.push(
        `Improve resume ATS score (currently ${resume}%) by adding missing technical keywords and quantifiable metrics.`
      );
    }

    // 2. Interview Recommendations
    if (!interviewMetrics || interviewMetrics.completed === 0) {
      recommendations.push(
        'Complete your first AI Mock Interview session to baseline your interview performance score.'
      );
    } else if (interview < 75) {
      recommendations.push(
        `Practice additional mock interview sessions to raise your average score (currently ${interview}/100).`
      );
    }

    // 3. Profile Recommendations
    if (profile < 85) {
      recommendations.push(
        'Complete missing candidate profile fields (bio, headline, education, social links) to boost profile completeness.'
      );
    }

    // 4. Skills Recommendations
    if (skills < 75) {
      recommendations.push(
        'Add at least 5 relevant technical skills with proficiency levels to strengthen your candidate profile.'
      );
    }

    // 5. Application Recommendations
    if (!applicationMetrics || applicationMetrics.total === 0) {
      recommendations.push(
        'Start applying to active job postings to build job search momentum and track application conversion.'
      );
    } else if (applications < 60) {
      recommendations.push(
        'Submit applications to additional job listings to increase your interview invite pipeline.'
      );
    }

    return recommendations;
  }

  /**
   * Calculate candidate's overall Career Readiness Score dynamically.
   *
   * @param {string} userId
   * @returns {Promise<Object>} Standardized Career Readiness response payload
   */
  async calculateCareerReadiness(userId) {
    const [profileStats, resumeMetrics, interviewMetrics, applicationMetrics] =
      await Promise.all([
        dashboardRepository.getProfileStats(userId),
        dashboardRepository.getResumeStats(userId),
        dashboardRepository.getInterviewStats(userId),
        dashboardRepository.getApplicationStats(userId),
      ]);

    const profileScore = this.calculateProfileComponent(profileStats);
    const resumeScore = this.calculateResumeComponent(resumeMetrics);
    const interviewScore = this.calculateInterviewComponent(interviewMetrics);
    const applicationScore = this.calculateApplicationComponent(applicationMetrics);
    const skillsScore = this.calculateSkillsComponent(profileStats);

    const weights = {
      profile: 0.15,
      resume: 0.30,
      interview: 0.30,
      applications: 0.10,
      skills: 0.15,
    };

    const overallScore = Math.round(
      profileScore * weights.profile +
        resumeScore * weights.resume +
        interviewScore * weights.interview +
        applicationScore * weights.applications +
        skillsScore * weights.skills
    );

    const components = {
      profile: profileScore,
      resume: resumeScore,
      interview: interviewScore,
      applications: applicationScore,
      skills: skillsScore,
    };

    const readinessLevel = this.getReadinessLevel(overallScore);

    const recommendations = this.generateRecommendations(components, {
      profileStats,
      resumeMetrics,
      interviewMetrics,
      applicationMetrics,
    });

    return {
      overallScore,
      readinessLevel,
      components,
      weights,
      benchmarks: {
        industryAverage: 72,
        targetScore: 85,
      },
      recommendations,
    };
  }
}

export default new CareerScoreService();
export { CareerScoreService };
