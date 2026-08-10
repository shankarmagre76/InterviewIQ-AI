import geminiProvider from '../services/ai.service.js';
import aiResponseParserService from '../services/aiResponseParser.service.js';
import { buildLearningRoadmapPrompt } from './learningRoadmap.prompt.js';
import LearningRoadmap from './learningRoadmap.model.js';
import LearningTask from './learningTask.model.js';

// Domain Models for Context Retrieval
import Profile from '../profile/profile.model.js';
import Resume from '../resume/resume.model.js';
import ResumeAnalysis from '../resume/resumeAnalysis.model.js';
import Interview from '../interview/interview.model.js';
import InterviewResult from '../interview/interviewResult.model.js';
import Application from '../application/application.model.js';
import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';

/**
 * Dedicated AI Service for Learning Roadmap Generation & Regeneration
 * Handles multi-domain candidate context retrieval, Gemini API interaction,
 * response validation, and atomic database persistence of roadmaps and tasks.
 */
class LearningRoadmapAiService {
  /**
   * Aggregate candidate context across Profile, Resume, ATS Analysis, Interview, and Applications.
   * Handles empty or missing documents gracefully without throwing errors.
   *
   * @param {string} userId
   * @param {string} [targetRoleOverride=null]
   * @returns {Promise<Object>} Aggregated AI context payload
   */
  async getCandidateContext(userId, targetRoleOverride = null) {
    const [profile, activeResume, recentAnalysis, interviewResults, recentApps] =
      await Promise.all([
        Profile.findOne({ user: userId }).lean(),
        Resume.findOne({ user: userId, isActive: true }).lean(),
        ResumeAnalysis.findOne({ user: userId }).sort({ createdAt: -1 }).lean(),
        InterviewResult.find({ user: userId })
          .sort({ createdAt: -1 })
          .limit(3)
          .lean(),
        Application.find({ user: userId })
          .populate('job', 'title location')
          .populate('company', 'companyName name')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

    // 1. Target Role & Experience Level
    const targetRole =
      targetRoleOverride ||
      profile?.headline ||
      profile?.currentRole ||
      'Software Engineer / Technical Specialist';

    const experienceLevel = profile?.experienceLevel || 'Mid-Level';

    // 2. Verified Candidate Skills
    const skills = (profile?.skills || []).map((s) => (typeof s === 'string' ? s : s.name));

    // 3. Resume & ATS Analysis Context
    const atsAnalysis = recentAnalysis
      ? {
          atsScore: recentAnalysis.atsScore || 70,
          missingSkills: recentAnalysis.missingSkills || [],
          recommendedSkills: recentAnalysis.recommendedSkills || [],
          weaknesses: recentAnalysis.weaknesses || [],
        }
      : null;

    // 4. Interview Performance Context
    let interviewPerformance = null;
    if (interviewResults && interviewResults.length > 0) {
      const totalScore = interviewResults.reduce(
        (sum, r) => sum + (r.overallScore || 0),
        0
      );
      const avgScore = Math.round(totalScore / interviewResults.length);
      const allWeaknesses = interviewResults.flatMap((r) => r.weaknesses || []);

      interviewPerformance = {
        averageScore: avgScore,
        technicalScore: interviewResults[0].technicalScore || avgScore,
        communicationScore: interviewResults[0].communicationScore || avgScore,
        hrScore: interviewResults[0].hrScore || avgScore,
        weaknesses: Array.from(new Set(allWeaknesses)).slice(0, 5),
      };
    }

    // 5. Job Application Target Context
    let jobApplicationContext = null;
    if (recentApps && recentApps.length > 0) {
      const companies = recentApps
        .map((a) => a.company?.companyName || a.company?.name)
        .filter(Boolean);
      jobApplicationContext = {
        targetCompanies: Array.from(new Set(companies)),
      };
    }

    return {
      targetRole,
      experienceLevel,
      skills,
      resumeSummary: activeResume ? `Active Resume: ${activeResume.originalName}` : '',
      atsAnalysis,
      interviewPerformance,
      jobApplicationContext,
    };
  }

  /**
   * Main entry point to generate a fresh Learning Roadmap or regenerate an existing one.
   *
   * @param {string} userId
   * @param {Object} [options={}] - { targetRole: string, forceRegenerate: boolean }
   * @returns {Promise<Object>} Created LearningRoadmap document with populated tasks
   */
  async generateRoadmap(userId, options = {}) {
    const { targetRole: targetRoleOverride = null, forceRegenerate = false } = options;

    logger.info(`Initiating AI Learning Roadmap generation for user ${userId}...`);

    // 1. Archive existing active roadmap if forceRegenerate is true or active roadmap exists
    const existingActive = await LearningRoadmap.findOne({
      user: userId,
      isActive: true,
    });

    let newVersion = 1;
    if (existingActive) {
      newVersion = (existingActive.version || 1) + 1;
      existingActive.status = 'ARCHIVED';
      existingActive.isActive = false;
      await existingActive.save();
      logger.info(
        `Archived previous active roadmap (${existingActive._id}) - Incremented new version to ${newVersion}`
      );
    }

    // 2. Build candidate context
    const context = await this.getCandidateContext(userId, targetRoleOverride);

    // 3. Construct engineered prompt
    const prompt = buildLearningRoadmapPrompt(context);

    // 4. Send prompt to Gemini AI Provider (with rate-limit retry backoff)
    let rawAiText;
    try {
      rawAiText = await geminiProvider.generateContentWithRetry(prompt);
    } catch (aiErr) {
      logger.error(`Gemini API execution failed for roadmap generation: ${aiErr.message}`);
      throw ApiError.internal(
        `AI Roadmap generation service unavailable: ${aiErr.message}`
      );
    }

    // 5. Parse & validate AI JSON response using AiResponseParserService
    const parsedRoadmap =
      aiResponseParserService.parseAndValidateRoadmapResponse(rawAiText);

    // 6. Create LearningRoadmap document
    const roadmapDoc = new LearningRoadmap({
      user: userId,
      targetRole: context.targetRole,
      title: parsedRoadmap.title,
      description: parsedRoadmap.description,
      skillGaps: parsedRoadmap.skillGaps,
      status: 'ACTIVE',
      version: newVersion,
      isActive: true,
      aiProvider: 'gemini',
      promptVersion: '1.0.0',
      generatedAt: new Date(),
      phases: parsedRoadmap.phases.map((phase) => ({
        title: phase.title,
        description: phase.description,
        skills: phase.skills,
        priority: phase.priority,
        estimatedDays: phase.estimatedDays,
        order: phase.order,
        progress: 0,
        status: 'NOT_STARTED',
      })),
    });

    await roadmapDoc.save();
    logger.info(`Created LearningRoadmap document (${roadmapDoc._id}) with ${roadmapDoc.phases.length} phases.`);

    // 7. Create associated LearningTask documents linked to roadmap and subdocument phase IDs
    const createdTasks = [];
    for (let pIndex = 0; pIndex < roadmapDoc.phases.length; pIndex++) {
      const phaseDoc = roadmapDoc.phases[pIndex];
      const parsedPhase = parsedRoadmap.phases[pIndex];

      if (parsedPhase && parsedPhase.tasks && parsedPhase.tasks.length > 0) {
        for (const taskItem of parsedPhase.tasks) {
          const taskDoc = new LearningTask({
            user: userId,
            roadmap: roadmapDoc._id,
            phase: phaseDoc._id,
            title: taskItem.title,
            description: taskItem.description,
            type: taskItem.type,
            skills: taskItem.skills,
            priority: taskItem.priority,
            estimatedMinutes: taskItem.estimatedMinutes,
            order: taskItem.order,
            status: 'NOT_STARTED',
            resources: taskItem.resources || [],
          });
          await taskDoc.save();
          createdTasks.push(taskDoc);
        }
      }
    }

    logger.info(
      `Successfully generated LearningRoadmap (${roadmapDoc._id}) with ${createdTasks.length} associated LearningTasks.`
    );

    return {
      roadmap: roadmapDoc,
      tasks: createdTasks,
    };
  }
}

export default new LearningRoadmapAiService();
export { LearningRoadmapAiService };
