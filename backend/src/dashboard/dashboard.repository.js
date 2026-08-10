import mongoose from 'mongoose';
import Profile from '../profile/profile.model.js';
import Resume from '../resume/resume.model.js';
import ResumeAnalysis from '../resume/resumeAnalysis.model.js';
import Interview from '../interview/interview.model.js';
import InterviewResult from '../interview/interviewResult.model.js';
import Application from '../application/application.model.js';
import SavedJob from '../savedJob/savedJob.model.js';

/**
 * Dashboard Repository Layer
 * Interacts directly with MongoDB models to retrieve and aggregate candidate data.
 * Contains NO HTTP or service business logic.
 */
class DashboardRepository {
  /**
   * Fetch candidate profile data
   * @param {string} userId
   * @returns {Promise<Object|null>}
   */
  async getProfileData(userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    return await Profile.findOne({ user: userObjectId }).lean();
  }

  /**
   * Fetch candidate resume and ATS analysis metrics
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getResumeMetrics(userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [activeResume, analysisHistory, analysisCount] = await Promise.all([
      Resume.findOne({ user: userObjectId, isActive: true }).lean(),
      ResumeAnalysis.find({ user: userObjectId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      ResumeAnalysis.countDocuments({ user: userObjectId }),
    ]);

    const hasResume = !!activeResume || analysisCount > 0;
    const latestAnalysis = analysisHistory[0] || null;
    const previousAnalysis = analysisHistory[1] || null;

    return {
      hasResume,
      activeResume,
      latestAnalysis,
      previousAnalysis,
      analysisCount,
      scoreHistory: analysisHistory.map((item) => ({
        analysisId: item._id,
        atsScore: item.atsScore,
        date: item.createdAt || item.analyzedAt,
      })),
    };
  }

  /**
   * Fetch candidate mock interview metrics
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getInterviewMetrics(userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [interviews, completedResults] = await Promise.all([
      Interview.find({ user: userObjectId }).sort({ createdAt: -1 }).lean(),
      InterviewResult.find()
        .populate({
          path: 'interview',
          match: { user: userObjectId },
          select: 'role interviewType difficulty status createdAt',
        })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    // Filter results strictly belonging to this user
    const userResults = completedResults.filter(
      (res) => res.interview && res.interview !== null
    );

    const total = interviews.length;
    const completed = interviews.filter((i) => i.status === 'Completed').length;
    const inProgress = interviews.filter((i) => i.status === 'In Progress').length;
    const pending = interviews.filter((i) => i.status === 'Pending').length;

    let averageScore = 0;
    let bestScore = 0;
    let latestScore = 0;

    if (userResults.length > 0) {
      const sumScores = userResults.reduce(
        (acc, curr) => acc + (curr.overallScore || 0),
        0
      );
      averageScore = parseFloat((sumScores / userResults.length).toFixed(1));
      bestScore = Math.max(...userResults.map((r) => r.overallScore || 0));
      latestScore = userResults[0].overallScore || 0;
    }

    // Performance breakdown by interview type
    const byType = {
      Technical: { total: 0, completed: 0, sumScore: 0, countScore: 0 },
      HR: { total: 0, completed: 0, sumScore: 0, countScore: 0 },
      Behavioral: { total: 0, completed: 0, sumScore: 0, countScore: 0 },
      Mixed: { total: 0, completed: 0, sumScore: 0, countScore: 0 },
    };

    interviews.forEach((inv) => {
      const type = inv.interviewType || 'Technical';
      if (byType[type]) {
        byType[type].total += 1;
        if (inv.status === 'Completed') {
          byType[type].completed += 1;
        }
      }
    });

    userResults.forEach((res) => {
      const type = res.interview?.interviewType || 'Technical';
      if (byType[type]) {
        byType[type].sumScore += res.overallScore || 0;
        byType[type].countScore += 1;
      }
    });

    Object.keys(byType).forEach((type) => {
      const item = byType[type];
      item.avgScore =
        item.countScore > 0
          ? parseFloat((item.sumScore / item.countScore).toFixed(1))
          : 0;
      delete item.sumScore;
      delete item.countScore;
    });

    // Score distribution by competencies across completed results
    let technicalSum = 0,
      commSum = 0,
      hrSum = 0,
      resCount = userResults.length;
    if (resCount > 0) {
      userResults.forEach((r) => {
        technicalSum += r.technicalScore || r.overallScore || 0;
        commSum += r.communicationScore || r.overallScore || 0;
        hrSum += r.hrScore || r.overallScore || 0;
      });
    }

    const scoreDistribution = {
      technicalScore: resCount > 0 ? parseFloat((technicalSum / resCount).toFixed(1)) : 0,
      communicationScore: resCount > 0 ? parseFloat((commSum / resCount).toFixed(1)) : 0,
      hrScore: resCount > 0 ? parseFloat((hrSum / resCount).toFixed(1)) : 0,
    };

    return {
      total,
      completed,
      inProgress,
      pending,
      averageScore,
      bestScore,
      latestScore,
      byType,
      scoreDistribution,
      recentInterviews: interviews.slice(0, 5),
    };
  }

  /**
   * Fetch candidate job application metrics
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getApplicationMetrics(userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const applications = await Application.find({ user: userObjectId })
      .populate('job', 'title location workMode company')
      .populate('company', 'name logo')
      .sort({ appliedAt: -1, createdAt: -1 })
      .lean();

    const total = applications.length;

    const counts = {
      applied: 0,
      underReview: 0,
      interview: 0,
      offered: 0,
      rejected: 0,
      withdrawn: 0,
    };

    applications.forEach((app) => {
      switch (app.status) {
        case 'Applied':
          counts.applied += 1;
          break;
        case 'Under Review':
          counts.underReview += 1;
          break;
        case 'Interview Scheduled':
        case 'Technical Round':
        case 'HR Round':
          counts.interview += 1;
          break;
        case 'Offered':
          counts.offered += 1;
          break;
        case 'Rejected':
          counts.rejected += 1;
          break;
        case 'Withdrawn':
          counts.withdrawn += 1;
          break;
        default:
          counts.applied += 1;
      }
    });

    const interviewConversionRate =
      total > 0
        ? parseFloat((((counts.interview + counts.offered) / total) * 100).toFixed(1))
        : 0;

    const offerConversionRate =
      total > 0
        ? parseFloat(((counts.offered / total) * 100).toFixed(1))
        : 0;

    return {
      total,
      ...counts,
      interviewConversionRate,
      offerConversionRate,
      recentApplications: applications.slice(0, 5),
    };
  }

  /**
   * Fetch candidate saved jobs count & metrics
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getSavedJobMetrics(userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const total = await SavedJob.countDocuments({ user: userObjectId });
    return { total };
  }

  /**
   * Fetch aggregated recent activities sorted by timestamp
   * @param {string} userId
   * @param {Object} options - { limit: number, page: number, type: string }
   * @returns {Promise<Object>}
   */
  async getRecentActivities(userId, options = {}) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const { limit = 10, page = 1, type = null } = options;

    const [resumes, analyses, interviews, applications, savedJobs] = await Promise.all([
      Resume.find({ user: userObjectId }).sort({ createdAt: -1 }).limit(10).lean(),
      ResumeAnalysis.find({ user: userObjectId }).sort({ createdAt: -1 }).limit(10).lean(),
      Interview.find({ user: userObjectId }).sort({ createdAt: -1 }).limit(10).lean(),
      Application.find({ user: userObjectId })
        .populate('job', 'title')
        .populate('company', 'name')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      SavedJob.find({ user: userObjectId })
        .populate('job', 'title')
        .sort({ savedAt: -1, createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const activities = [];

    resumes.forEach((r) => {
      activities.push({
        id: r._id,
        activityType: 'RESUME_UPLOAD',
        title: `Uploaded resume "${r.originalName}"`,
        date: r.uploadedAt || r.createdAt,
        metadata: { resumeId: r._id, fileName: r.originalName },
      });
    });

    analyses.forEach((a) => {
      activities.push({
        id: a._id,
        activityType: 'RESUME_ANALYSIS',
        title: `Analyzed Resume: ATS Score ${a.atsScore}%`,
        date: a.createdAt || a.analyzedAt,
        metadata: { analysisId: a._id, atsScore: a.atsScore },
      });
    });

    interviews.forEach((i) => {
      const isCompleted = i.status === 'Completed';
      activities.push({
        id: i._id,
        activityType: isCompleted ? 'INTERVIEW_COMPLETED' : 'INTERVIEW_STARTED',
        title: `${isCompleted ? 'Completed' : 'Started'} ${i.interviewType || 'Mock'} Interview for ${i.role}`,
        date: i.completedAt || i.startedAt || i.createdAt,
        metadata: { interviewId: i._id, role: i.role, status: i.status },
      });
    });

    applications.forEach((app) => {
      const jobTitle = app.job?.title || 'Job Posting';
      const companyName = app.company?.name || '';
      activities.push({
        id: app._id,
        activityType: 'APPLICATION_SUBMITTED',
        title: `Applied for ${jobTitle} ${companyName ? `at ${companyName}` : ''}`.trim(),
        date: app.appliedAt || app.createdAt,
        metadata: {
          applicationId: app._id,
          jobTitle,
          companyName,
          status: app.status,
        },
      });
    });

    savedJobs.forEach((sj) => {
      const jobTitle = sj.job?.title || 'Job Posting';
      activities.push({
        id: sj._id,
        activityType: 'JOB_SAVED',
        title: `Saved job posting: ${jobTitle}`,
        date: sj.savedAt || sj.createdAt,
        metadata: { savedJobId: sj._id, jobTitle },
      });
    });

    // Sort combined activities descending by timestamp
    let filteredActivities = activities.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Apply type filter if provided
    if (type) {
      filteredActivities = filteredActivities.filter(
        (act) => act.activityType.toUpperCase() === type.toUpperCase()
      );
    }

    const totalItems = filteredActivities.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedActivities = filteredActivities.slice(startIndex, startIndex + limit);

    return {
      activities: paginatedActivities,
      pagination: {
        totalItems,
        page: Number(page),
        limit: Number(limit),
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}

export default new DashboardRepository();
