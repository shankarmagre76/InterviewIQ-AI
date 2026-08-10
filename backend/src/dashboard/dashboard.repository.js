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
 * Implements optimized MongoDB aggregation pipelines and database access logic
 * for candidate dashboard statistics.
 * Contains ZERO business logic.
 */
class DashboardRepository {
  /**
   * Helper to ensure userId is converted to a valid Mongoose ObjectId instance.
   * @param {string|mongoose.Types.ObjectId} userId
   * @returns {mongoose.Types.ObjectId}
   */
  toObjectId(userId) {
    if (userId instanceof mongoose.Types.ObjectId) return userId;
    return new mongoose.Types.ObjectId(userId);
  }

  /**
   * 1. Retrieve lightweight candidate profile statistics.
   * Uses projection aggregation to compute section counts without loading heavy subdocuments.
   *
   * @param {string|mongoose.Types.ObjectId} userId
   * @returns {Promise<Object>} Predictable profile statistics structure
   */
  async getProfileStats(userId) {
    const userObjectId = this.toObjectId(userId);

    const [stats] = await Profile.aggregate([
      { $match: { user: userObjectId } },
      {
        $project: {
          _id: 1,
          user: 1,
          headline: { $ifNull: ['$headline', ''] },
          bio: { $ifNull: ['$bio', ''] },
          skillsCount: { $size: { $ifNull: ['$skills', []] } },
          educationCount: { $size: { $ifNull: ['$education', []] } },
          experienceCount: { $size: { $ifNull: ['$experience', []] } },
          hasSocialLinks: {
            $gt: [
              {
                $size: {
                  $objectToArray: { $ifNull: ['$socialLinks', {}] },
                },
              },
              0,
            ],
          },
          hasBasicInfo: {
            $or: [
              { $gt: [{ $strLenCP: { $ifNull: ['$phone', ''] } }, 0] },
              { $gt: [{ $strLenCP: { $ifNull: ['$currentLocation', ''] } }, 0] },
              { $ne: ['$dateOfBirth', null] },
            ],
          },
        },
      },
    ]);

    if (!stats) {
      return {
        hasProfile: false,
        headline: '',
        bio: '',
        skillsCount: 0,
        educationCount: 0,
        experienceCount: 0,
        hasSocialLinks: false,
        hasBasicInfo: false,
      };
    }

    return {
      hasProfile: true,
      headline: stats.headline,
      bio: stats.bio,
      skillsCount: stats.skillsCount,
      educationCount: stats.educationCount,
      experienceCount: stats.experienceCount,
      hasSocialLinks: stats.hasSocialLinks,
      hasBasicInfo: stats.hasBasicInfo,
    };
  }

  /**
   * 2. Retrieve resume & ATS analysis statistics using MongoDB aggregation facets.
   * Efficiently computes total analysis count, latest ATS score, previous ATS score,
   * and score improvement in a single aggregation pipeline query.
   *
   * @param {string|mongoose.Types.ObjectId} userId
   * @returns {Promise<Object>} Predictable resume metrics object
   */
  async getResumeStats(userId) {
    const userObjectId = this.toObjectId(userId);

    const [activeResume, analysisStats] = await Promise.all([
      Resume.findOne(
        { user: userObjectId, isActive: true },
        { _id: 1, originalName: 1, url: 1, uploadedAt: 1 }
      ).lean(),

      ResumeAnalysis.aggregate([
        { $match: { user: userObjectId } },
        { $sort: { createdAt: -1 } },
        {
          $facet: {
            totalCount: [{ $count: 'count' }],
            latestTwo: [
              { $limit: 2 },
              {
                $project: {
                  _id: 1,
                  atsScore: 1,
                  summary: 1,
                  strengths: 1,
                  weaknesses: 1,
                  missingSkills: 1,
                  recommendedSkills: 1,
                  sectionFeedback: 1,
                  createdAt: 1,
                },
              },
            ],
          },
        },
      ]),
    ]);

    const facetResult = analysisStats[0] || {};
    const totalCount = facetResult.totalCount?.[0]?.count || 0;
    const latestTwo = facetResult.latestTwo || [];

    const latestAnalysis = latestTwo[0] || null;
    const previousAnalysis = latestTwo[1] || null;

    const latestATSScore = latestAnalysis?.atsScore || 0;
    const previousATSScore = previousAnalysis?.atsScore || 0;
    const scoreImprovement = latestAnalysis ? latestATSScore - previousATSScore : 0;

    return {
      hasResume: !!activeResume || totalCount > 0,
      latestATSScore,
      previousATSScore,
      scoreImprovement,
      analysisCount: totalCount,
      activeResume: activeResume || null,
      latestAnalysis: latestAnalysis || null,
    };
  }

  /**
   * 3. Compute comprehensive mock interview performance statistics.
   * Uses aggregation pipeline with $lookup to aggregate completed interview scores, best score,
   * average score, competency breakdowns, and status distribution.
   *
   * @param {string|mongoose.Types.ObjectId} userId
   * @returns {Promise<Object>} Predictable interview metrics structure
   */
  async getInterviewStats(userId) {
    const userObjectId = this.toObjectId(userId);

    const [statusStats, resultStats, recentInterviews] = await Promise.all([
      // Aggregation 1: Count interviews grouped by status & type
      Interview.aggregate([
        { $match: { user: userObjectId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      // Aggregation 2: Join completed interviews with InterviewResult for overall & competency averages
      Interview.aggregate([
        { $match: { user: userObjectId, status: 'Completed' } },
        {
          $lookup: {
            from: 'interviewresults',
            localField: '_id',
            foreignField: 'interview',
            as: 'result',
          },
        },
        { $unwind: '$result' },
        {
          $group: {
            _id: null,
            completedCount: { $sum: 1 },
            averageScore: { $avg: '$result.overallScore' },
            bestScore: { $max: '$result.overallScore' },
            latestScore: { $first: '$result.overallScore' },
            technicalAvg: {
              $avg: { $ifNull: ['$result.technicalScore', '$result.overallScore'] },
            },
            communicationAvg: {
              $avg: { $ifNull: ['$result.communicationScore', '$result.overallScore'] },
            },
            hrAvg: {
              $avg: { $ifNull: ['$result.hrScore', '$result.overallScore'] },
            },
          },
        },
      ]),

      // Query 3: Recent 5 interview sessions projection
      Interview.find(
        { user: userObjectId },
        { _id: 1, role: 1, interviewType: 1, difficulty: 1, status: 1, createdAt: 1 }
      )
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const statusCounts = {
      total: 0,
      completed: 0,
      inProgress: 0,
      pending: 0,
      cancelled: 0,
    };

    statusStats.forEach((st) => {
      statusCounts.total += st.count;
      if (st._id === 'Completed') statusCounts.completed = st.count;
      else if (st._id === 'In Progress') statusCounts.inProgress = st.count;
      else if (st._id === 'Pending') statusCounts.pending = st.count;
      else if (st._id === 'Cancelled') statusCounts.cancelled = st.count;
    });

    const scores = resultStats[0] || {};
    const averageScore = scores.averageScore ? parseFloat(scores.averageScore.toFixed(1)) : 0;
    const bestScore = scores.bestScore || 0;
    const latestScore = scores.latestScore || 0;

    const scoreDistribution = {
      technicalScore: scores.technicalAvg ? parseFloat(scores.technicalAvg.toFixed(1)) : 0,
      communicationScore: scores.communicationAvg ? parseFloat(scores.communicationAvg.toFixed(1)) : 0,
      hrScore: scores.hrAvg ? parseFloat(scores.hrAvg.toFixed(1)) : 0,
    };

    return {
      total: statusCounts.total,
      completed: statusCounts.completed,
      inProgress: statusCounts.inProgress,
      pending: statusCounts.pending,
      cancelled: statusCounts.cancelled,
      averageScore,
      bestScore,
      latestScore,
      scoreDistribution,
      recentInterviews,
    };
  }

  /**
   * 4. Aggregate candidate job application counts & conversion metrics.
   * Single pass aggregation pipeline grouping applications by status.
   *
   * @param {string|mongoose.Types.ObjectId} userId
   * @returns {Promise<Object>} Predictable application statistics object
   */
  async getApplicationStats(userId) {
    const userObjectId = this.toObjectId(userId);

    const [stats] = await Application.aggregate([
      { $match: { user: userObjectId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          applied: { $sum: { $cond: [{ $eq: ['$status', 'Applied'] }, 1, 0] } },
          underReview: { $sum: { $cond: [{ $eq: ['$status', 'Under Review'] }, 1, 0] } },
          interview: {
            $sum: {
              $cond: [
                {
                  $in: [
                    '$status',
                    ['Interview Scheduled', 'Technical Round', 'HR Round'],
                  ],
                },
                1,
                0,
              ],
            },
          },
          offered: { $sum: { $cond: [{ $eq: ['$status', 'Offered'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } },
          withdrawn: { $sum: { $cond: [{ $eq: ['$status', 'Withdrawn'] }, 1, 0] } },
        },
      },
    ]);

    if (!stats || stats.total === 0) {
      return {
        total: 0,
        applied: 0,
        underReview: 0,
        interview: 0,
        offered: 0,
        rejected: 0,
        withdrawn: 0,
        interviewConversionRate: 0,
        offerConversionRate: 0,
      };
    }

    const total = stats.total;
    const interviewConversionRate = parseFloat(
      (((stats.interview + stats.offered) / total) * 100).toFixed(1)
    );
    const offerConversionRate = parseFloat(
      ((stats.offered / total) * 100).toFixed(1)
    );

    return {
      total,
      applied: stats.applied,
      underReview: stats.underReview,
      interview: stats.interview,
      offered: stats.offered,
      rejected: stats.rejected,
      withdrawn: stats.withdrawn,
      interviewConversionRate,
      offerConversionRate,
    };
  }

  /**
   * 5. Retrieve saved jobs total count.
   * Uses fast indexed countDocuments query.
   *
   * @param {string|mongoose.Types.ObjectId} userId
   * @returns {Promise<Object>} { total: number }
   */
  async getSavedJobStats(userId) {
    const userObjectId = this.toObjectId(userId);
    const total = await SavedJob.countDocuments({ user: userObjectId });
    return { total };
  }

  /**
   * 6. Consolidate recent user activity feed across domain models with pagination and projection.
   *
   * @param {string|mongoose.Types.ObjectId} userId
   * @param {Object} [options={}] - { limit: 10, page: 1, type: null }
   * @returns {Promise<Object>} Activity feed structure with pagination
   */
  async getRecentActivity(userId, options = {}) {
    const userObjectId = this.toObjectId(userId);
    const limit = Math.max(1, parseInt(options.limit || 10, 10));
    const page = Math.max(1, parseInt(options.page || 1, 10));
    const type = options.type || null;

    const [resumes, analyses, interviews, applications, savedJobs] = await Promise.all([
      Resume.find({ user: userObjectId }, { _id: 1, originalName: 1, uploadedAt: 1, createdAt: 1 })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      ResumeAnalysis.find(
        { user: userObjectId },
        { _id: 1, atsScore: 1, analyzedAt: 1, createdAt: 1 }
      )
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      Interview.find(
        { user: userObjectId },
        { _id: 1, role: 1, interviewType: 1, status: 1, completedAt: 1, startedAt: 1, createdAt: 1 }
      )
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      Application.find(
        { user: userObjectId },
        { _id: 1, job: 1, company: 1, status: 1, appliedAt: 1, createdAt: 1 }
      )
        .populate('job', 'title')
        .populate('company', 'companyName name')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      SavedJob.find({ user: userObjectId }, { _id: 1, job: 1, savedAt: 1, createdAt: 1 })
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
      const companyName = app.company?.companyName || app.company?.name || '';
      activities.push({
        id: app._id,
        activityType: 'APPLICATION_SUBMITTED',
        title: `Applied for ${jobTitle}${companyName ? ` at ${companyName}` : ''}`,
        date: app.appliedAt || app.createdAt,
        metadata: { applicationId: app._id, jobTitle, companyName, status: app.status },
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

    let sorted = activities.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (type) {
      sorted = sorted.filter(
        (act) => act.activityType.toUpperCase() === type.toUpperCase()
      );
    }

    const totalItems = sorted.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedActivities = sorted.slice(startIndex, startIndex + limit);

    return {
      activities: paginatedActivities,
      pagination: {
        totalItems,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * 7. Retrieve chronological ATS score history for candidate progress tracking.
   * Aggregation pipeline sorting analysis records chronologically with projection.
   *
   * @param {string|mongoose.Types.ObjectId} userId
   * @returns {Promise<Array<Object>>} List of ATS score history items
   */
  async getATSScoreHistory(userId) {
    const userObjectId = this.toObjectId(userId);

    return await ResumeAnalysis.aggregate([
      { $match: { user: userObjectId } },
      { $sort: { createdAt: 1 } },
      {
        $project: {
          _id: 0,
          analysisId: '$_id',
          atsScore: 1,
          aiProvider: { $ifNull: ['$aiProvider', 'Gemini'] },
          aiModel: { $ifNull: ['$aiModel', 'gemini-1.5-pro'] },
          date: { $ifNull: ['$analyzedAt', '$createdAt'] },
        },
      },
    ]);
  }

  /**
   * 8. Retrieve chronological score history for completed mock interviews.
   * Aggregation pipeline joining completed interviews with InterviewResult documents.
   *
   * @param {string|mongoose.Types.ObjectId} userId
   * @returns {Promise<Array<Object>>} List of interview score history records
   */
  async getInterviewScoreHistory(userId) {
    const userObjectId = this.toObjectId(userId);

    return await Interview.aggregate([
      { $match: { user: userObjectId, status: 'Completed' } },
      { $sort: { completedAt: 1, createdAt: 1 } },
      {
        $lookup: {
          from: 'interviewresults',
          localField: '_id',
          foreignField: 'interview',
          as: 'result',
        },
      },
      { $unwind: '$result' },
      {
        $project: {
          _id: 0,
          interviewId: '$_id',
          role: 1,
          interviewType: 1,
          difficulty: 1,
          overallScore: '$result.overallScore',
          technicalScore: '$result.technicalScore',
          communicationScore: '$result.communicationScore',
          hrScore: '$result.hrScore',
          date: { $ifNull: ['$completedAt', '$createdAt'] },
        },
      },
    ]);
  }

  /**
   * 9. Compute application status breakdown statistics & conversion funnel.
   * Aggregation pipeline grouping application status counts and computing percentages.
   *
   * @param {string|mongoose.Types.ObjectId} userId
   * @returns {Promise<Object>} Application status funnel statistics
   */
  async getApplicationStatusStats(userId) {
    const userObjectId = this.toObjectId(userId);

    const [funnel] = await Application.aggregate([
      { $match: { user: userObjectId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          applied: { $sum: { $cond: [{ $eq: ['$status', 'Applied'] }, 1, 0] } },
          underReview: { $sum: { $cond: [{ $eq: ['$status', 'Under Review'] }, 1, 0] } },
          interview: {
            $sum: {
              $cond: [
                {
                  $in: [
                    '$status',
                    ['Interview Scheduled', 'Technical Round', 'HR Round'],
                  ],
                },
                1,
                0,
              ],
            },
          },
          offered: { $sum: { $cond: [{ $eq: ['$status', 'Offered'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } },
          withdrawn: { $sum: { $cond: [{ $eq: ['$status', 'Withdrawn'] }, 1, 0] } },
        },
      },
    ]);

    if (!funnel || funnel.total === 0) {
      return {
        total: 0,
        statusBreakdown: {
          applied: 0,
          underReview: 0,
          interview: 0,
          offered: 0,
          rejected: 0,
          withdrawn: 0,
        },
        funnelStages: [
          { stage: 'Applied', count: 0, percentage: 0 },
          { stage: 'Under Review', count: 0, percentage: 0 },
          { stage: 'Interview', count: 0, percentage: 0 },
          { stage: 'Offered', count: 0, percentage: 0 },
        ],
        conversionRates: {
          interviewConversionRate: 0,
          offerConversionRate: 0,
        },
      };
    }

    const total = funnel.total;
    const interviewConversionRate = parseFloat(
      (((funnel.interview + funnel.offered) / total) * 100).toFixed(1)
    );
    const offerConversionRate = parseFloat(
      ((funnel.offered / total) * 100).toFixed(1)
    );

    return {
      total,
      statusBreakdown: {
        applied: funnel.applied,
        underReview: funnel.underReview,
        interview: funnel.interview,
        offered: funnel.offered,
        rejected: funnel.rejected,
        withdrawn: funnel.withdrawn,
      },
      funnelStages: [
        { stage: 'Applied', count: total, percentage: 100 },
        {
          stage: 'Under Review',
          count: funnel.underReview,
          percentage: parseFloat(((funnel.underReview / total) * 100).toFixed(1)),
        },
        { stage: 'Interview', count: funnel.interview + funnel.offered, percentage: interviewConversionRate },
        { stage: 'Offered', count: funnel.offered, percentage: offerConversionRate },
      ],
      conversionRates: {
        interviewConversionRate,
        offerConversionRate,
      },
    };
  }

  /**
   * 10. Retrieve raw resume analytics database metrics ($max, $min, $count, score history).
   * Executes a single aggregation pipeline with $facet to compute highest, lowest, total count,
   * latest 2 analyses, and full chronological score history.
   *
   * @param {string|mongoose.Types.ObjectId} userId
   * @returns {Promise<Object>} Raw analytics database results
   */
  async getResumeAnalyticsData(userId) {
    const userObjectId = this.toObjectId(userId);

    const [activeResume, aggregateResult, chronologicalHistory] = await Promise.all([
      Resume.findOne(
        { user: userObjectId, isActive: true },
        { _id: 1, originalName: 1, url: 1, uploadedAt: 1, isActive: 1, parsingStatus: 1 }
      ).lean(),

      ResumeAnalysis.aggregate([
        { $match: { user: userObjectId } },
        { $sort: { createdAt: -1 } },
        {
          $facet: {
            stats: [
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  highestScore: { $max: '$atsScore' },
                  lowestScore: { $min: '$atsScore' },
                },
              },
            ],
            latestTwo: [
              { $limit: 2 },
              {
                $project: {
                  _id: 1,
                  atsScore: 1,
                  summary: 1,
                  strengths: 1,
                  weaknesses: 1,
                  missingSkills: 1,
                  recommendedSkills: 1,
                  sectionFeedback: 1,
                  createdAt: 1,
                  analyzedAt: 1,
                },
              },
            ],
          },
        },
      ]),

      ResumeAnalysis.aggregate([
        { $match: { user: userObjectId } },
        { $sort: { createdAt: 1 } },
        {
          $project: {
            _id: 0,
            analysisId: '$_id',
            score: '$atsScore',
            date: { $ifNull: ['$analyzedAt', '$createdAt'] },
            aiProvider: { $ifNull: ['$aiProvider', 'Gemini'] },
          },
        },
      ]),
    ]);

    return {
      activeResume,
      aggregateResult: aggregateResult[0] || {},
      chronologicalHistory: chronologicalHistory || [],
    };
  }

  /**
   * 11. Retrieve raw interview analytics metrics grouped by status, type, difficulty, and chronological score history.
   * Runs parallel aggregation pipelines joining Interview and InterviewResult documents.
   *
   * @param {string|mongoose.Types.ObjectId} userId
   * @returns {Promise<Object>} Raw interview analytics database metrics
   */
  async getInterviewAnalyticsData(userId) {
    const userObjectId = this.toObjectId(userId);

    const [statusStats, difficultyStats, typeStats, completedResults, recentInterviews] =
      await Promise.all([
        // 1. Group status counts
        Interview.aggregate([
          { $match: { user: userObjectId } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ]),

        // 2. Group by difficulty with completed count and score lookup
        Interview.aggregate([
          { $match: { user: userObjectId } },
          {
            $lookup: {
              from: 'interviewresults',
              localField: '_id',
              foreignField: 'interview',
              as: 'result',
            },
          },
          {
            $group: {
              _id: '$difficulty',
              total: { $sum: 1 },
              completed: {
                $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
              },
              scores: {
                $push: {
                  $cond: [
                    { $and: [{ $eq: ['$status', 'Completed'] }, { $gt: [{ $size: '$result' }, 0] }] },
                    { $arrayElemAt: ['$result.overallScore', 0] },
                    '$$REMOVE',
                  ],
                },
              },
            },
          },
        ]),

        // 3. Group by interviewType with completed count and score lookup
        Interview.aggregate([
          { $match: { user: userObjectId } },
          {
            $lookup: {
              from: 'interviewresults',
              localField: '_id',
              foreignField: 'interview',
              as: 'result',
            },
          },
          {
            $group: {
              _id: '$interviewType',
              total: { $sum: 1 },
              completed: {
                $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
              },
              scores: {
                $push: {
                  $cond: [
                    { $and: [{ $eq: ['$status', 'Completed'] }, { $gt: [{ $size: '$result' }, 0] }] },
                    { $arrayElemAt: ['$result.overallScore', 0] },
                    '$$REMOVE',
                  ],
                },
              },
            },
          },
        ]),

        // 4. Chronological history of completed interviews joined with InterviewResult
        Interview.aggregate([
          { $match: { user: userObjectId, status: 'Completed' } },
          {
            $lookup: {
              from: 'interviewresults',
              localField: '_id',
              foreignField: 'interview',
              as: 'result',
            },
          },
          { $unwind: '$result' },
          { $sort: { completedAt: 1, createdAt: 1 } },
          {
            $project: {
              _id: 0,
              interviewId: '$_id',
              role: 1,
              interviewType: 1,
              difficulty: 1,
              overallScore: '$result.overallScore',
              technicalScore: { $ifNull: ['$result.technicalScore', '$result.overallScore'] },
              communicationScore: { $ifNull: ['$result.communicationScore', '$result.overallScore'] },
              hrScore: { $ifNull: ['$result.hrScore', '$result.overallScore'] },
              date: { $ifNull: ['$completedAt', '$createdAt'] },
            },
          },
        ]),

        // 5. Recent 5 interview sessions
        Interview.find(
          { user: userObjectId },
          { _id: 1, role: 1, interviewType: 1, difficulty: 1, status: 1, createdAt: 1 }
        )
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

    return {
      statusStats,
      difficultyStats,
      typeStats,
      completedResults,
      recentInterviews,
    };
  }

  /**
   * 12. Retrieve raw job application analytics metrics (status counts, trend over time, top companies, by location).
   * Runs parallel aggregation pipelines on Application collection with $lookup to Job and Company.
   *
   * @param {string|mongoose.Types.ObjectId} userId
   * @returns {Promise<Object>} Raw application analytics database results
   */
  async getApplicationAnalyticsData(userId) {
    const userObjectId = this.toObjectId(userId);

    const [statusStats, monthlyTrend, companyStats, locationStats, recentApplications] =
      await Promise.all([
        // 1. Status breakdown counts
        Application.aggregate([
          { $match: { user: userObjectId } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ]),

        // 2. Application trend over time (grouped by YYYY-MM)
        Application.aggregate([
          { $match: { user: userObjectId } },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m',
                  date: { $ifNull: ['$appliedAt', '$createdAt'] },
                },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),

        // 3. Top companies applied to
        Application.aggregate([
          { $match: { user: userObjectId } },
          {
            $lookup: {
              from: 'companies',
              localField: 'company',
              foreignField: '_id',
              as: 'companyDoc',
            },
          },
          { $unwind: { path: '$companyDoc', preserveNullAndEmptyArrays: true } },
          {
            $group: {
              _id: '$company',
              companyName: {
                $first: {
                  $ifNull: ['$companyDoc.companyName', '$companyDoc.name', 'Unknown Company'],
                },
              },
              logo: { $first: '$companyDoc.companyLogo' },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ]),

        // 4. Applications by job location
        Application.aggregate([
          { $match: { user: userObjectId } },
          {
            $lookup: {
              from: 'jobs',
              localField: 'job',
              foreignField: '_id',
              as: 'jobDoc',
            },
          },
          { $unwind: { path: '$jobDoc', preserveNullAndEmptyArrays: true } },
          {
            $group: {
              _id: { $ifNull: ['$jobDoc.location', 'Remote / Unspecified'] },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ]),

        // 5. Recent 5 applications with populated job & company
        Application.find(
          { user: userObjectId },
          { _id: 1, job: 1, company: 1, status: 1, appliedAt: 1, interviewDate: 1, createdAt: 1 }
        )
          .populate('job', 'title location workMode employmentType')
          .populate('company', 'companyName name companyLogo logo')
          .sort({ appliedAt: -1, createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

    return {
      statusStats,
      monthlyTrend,
      companyStats,
      locationStats,
      recentApplications,
    };
  }
}

export default new DashboardRepository();
export { DashboardRepository };
