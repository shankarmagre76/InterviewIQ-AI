import mongoose from 'mongoose';
import learningRoadmapAiService from './learningRoadmapAi.service.js';
import LearningRoadmap from './learningRoadmap.model.js';
import LearningTask from './learningTask.model.js';
import geminiProvider from '../services/ai.service.js';

import Profile from '../profile/profile.model.js';
import Resume from '../resume/resume.model.js';
import ResumeAnalysis from '../resume/resumeAnalysis.model.js';
import InterviewResult from '../interview/interviewResult.model.js';
import Application from '../application/application.model.js';

console.log('=== INTERVIEWIQ AI - PHASE 9.5 ROADMAP AI SERVICE TEST SUITE ===\n');

async function runRoadmapAiServiceTests() {
  let passedCount = 0;
  let failedCount = 0;

  const assert = (condition, testName, message = '') => {
    if (condition) {
      passedCount++;
      console.log(`[PASS] ${testName}`);
    } else {
      failedCount++;
      console.error(`[FAIL] ${testName} - ${message}`);
    }
  };

  try {
    // Stub Mongoose Model find calls for offline unit test
    const origProfileFindOne = Profile.findOne;
    const origResumeFindOne = Resume.findOne;
    const origAnalysisFindOne = ResumeAnalysis.findOne;
    const origInterviewFind = InterviewResult.find;
    const origApplicationFind = Application.find;

    Profile.findOne = () => ({ lean: async () => null });
    Resume.findOne = () => ({ lean: async () => null });
    ResumeAnalysis.findOne = () => ({ sort: () => ({ lean: async () => null }) });
    InterviewResult.find = () => ({ sort: () => ({ limit: () => ({ lean: async () => [] }) }) });
    Application.find = () => ({ populate: () => ({ populate: () => ({ sort: () => ({ limit: () => ({ lean: async () => [] }) }) }) }) });

    // 1. Context Aggregation Fallback Verification
    const testUserId = new mongoose.Types.ObjectId().toString();
    const context = await learningRoadmapAiService.getCandidateContext(testUserId);

    assert(typeof context === 'object', '1. getCandidateContext returns context object');
    assert(context.targetRole === 'Software Engineer / Technical Specialist', '2. Fallback target role applied when profile is empty');
    assert(Array.isArray(context.skills) && context.skills.length === 0, '3. Empty skills array returned for candidate with no profile');
    assert(context.atsAnalysis === null, '4. Null atsAnalysis returned for candidate with no resume');
    assert(context.interviewPerformance === null, '5. Null interviewPerformance returned for candidate with no interviews');

    // 2. Mock AI Response Integration
    const origGenerateContent = geminiProvider.generateContentWithRetry;
    const mockAiOutput = JSON.stringify({
      title: 'Full-Stack Developer Learning Roadmap',
      description: 'Master Node.js, Express, and React for full-stack candidate roles.',
      skillGaps: ['TypeScript', 'GraphQL'],
      phases: [
        {
          title: 'Phase 1: TypeScript Fundamentals',
          description: 'Learn strict typing, interfaces, and generics.',
          skills: ['TypeScript'],
          priority: 'HIGH',
          estimatedDays: 7,
          order: 1,
          tasks: [
            {
              title: 'Study TypeScript Official Handbook',
              description: 'Read Handbook sections on Primitive Types and Interfaces.',
              type: 'LEARNING',
              skills: ['TypeScript'],
              priority: 'HIGH',
              estimatedMinutes: 45,
              order: 1,
              resources: [
                {
                  title: 'TypeScript Docs',
                  url: 'https://www.typescriptlang.org/docs/',
                  type: 'DOCUMENTATION',
                },
              ],
            },
          ],
        },
      ],
    });

    geminiProvider.generateContentWithRetry = async () => mockAiOutput;

    // Stub MongoDB save calls for unit testing
    const savedRoadmaps = [];
    const savedTasks = [];

    const origRoadmapSave = LearningRoadmap.prototype.save;
    const origTaskSave = LearningTask.prototype.save;
    const origFindOne = LearningRoadmap.findOne;

    let mockActiveRoadmap = null;

    LearningRoadmap.findOne = async () => mockActiveRoadmap;

    LearningRoadmap.prototype.save = async function () {
      if (!this._id) this._id = new mongoose.Types.ObjectId();
      savedRoadmaps.push(this);
      return this;
    };

    LearningTask.prototype.save = async function () {
      if (!this._id) this._id = new mongoose.Types.ObjectId();
      savedTasks.push(this);
      return this;
    };

    // 3. First Roadmap Generation (Version 1)
    const resultV1 = await learningRoadmapAiService.generateRoadmap(testUserId);

    assert(!!resultV1.roadmap, '6. generateRoadmap returns created LearningRoadmap');
    assert(resultV1.roadmap.version === 1, '7. Initial roadmap version is 1');
    assert(resultV1.roadmap.isActive === true, '8. Initial roadmap isActive is true');
    assert(resultV1.roadmap.status === 'ACTIVE', '9. Initial roadmap status is ACTIVE');
    assert(resultV1.tasks.length === 1, '10. Associated LearningTask document created');
    assert(resultV1.tasks[0].type === 'LEARNING', '11. LearningTask type matches AI payload');

    // 4. Roadmap Regeneration Strategy (Version 2 + Archival of V1)
    mockActiveRoadmap = resultV1.roadmap; // Mock previous active roadmap in DB

    const resultV2 = await learningRoadmapAiService.generateRoadmap(testUserId, { forceRegenerate: true });

    assert(mockActiveRoadmap.status === 'ARCHIVED', '12. Regeneration updates previous active roadmap status to ARCHIVED');
    assert(mockActiveRoadmap.isActive === false, '13. Regeneration sets previous active roadmap isActive to false');
    assert(resultV2.roadmap.version === 2, '14. New regenerated roadmap increments version number to 2');
    assert(resultV2.roadmap.isActive === true, '15. New regenerated roadmap status is ACTIVE with isActive = true');

    // Restore original methods
    geminiProvider.generateContentWithRetry = origGenerateContent;
    LearningRoadmap.prototype.save = origRoadmapSave;
    LearningTask.prototype.save = origTaskSave;
    LearningRoadmap.findOne = origFindOne;
    Profile.findOne = origProfileFindOne;
    Resume.findOne = origResumeFindOne;
    ResumeAnalysis.findOne = origAnalysisFindOne;
    InterviewResult.find = origInterviewFind;
    Application.find = origApplicationFind;

  } catch (err) {
    assert(false, 'Roadmap AI Service test exception', err.message);
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} assertions.`);
  console.log(`==================================================\n`);
}

runRoadmapAiServiceTests();
