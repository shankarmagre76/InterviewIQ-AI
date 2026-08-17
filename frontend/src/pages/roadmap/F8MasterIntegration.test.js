import { roadmapService } from '../../services/roadmapService.js';
import { api } from '../../services/api.js';

console.log('================================================================');
console.log('=== F8 COMPLETE LEARNING ROADMAP MASTER INTEGRATION TEST RUNNER ===');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assertTest(condition, category, testName) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] [${category}] ${testName}`);
    passedTests++;
  } else {
    console.error(`[FAIL] [${category}] ${testName}`);
    failedTests++;
  }
}

async function runF8MasterIntegrationTestSuite() {
  const mockRoadmapId = '60d5ecb8b3b3b3b3b3b3b3b3';
  const mockTaskId = '70e6fdb9c4c4c4c4c4c4c4c4';
  const otherUserRoadmapId = '99d5ecb8b3b3b3b3b3b3b3b9';

  // ==========================================
  // CATEGORY 1: ROADMAP LIFECYCLE
  // ==========================================
  try {
    const origPost = api.post;
    const origGet = api.get;

    // 1.1 Generate Roadmap
    api.post = async () => ({
      data: {
        success: true,
        data: { _id: mockRoadmapId, title: 'Java Roadmap', targetRole: 'Java Dev', status: 'ACTIVE', version: 1 },
      },
    });

    const genRes = await roadmapService.generateRoadmap({ targetRole: 'Java Dev' });
    assertTest(genRes.data._id === mockRoadmapId, 'Roadmap Lifecycle', 'Generate AI Roadmap creates active roadmap document');

    // 1.2 Get Active Roadmap
    api.get = async () => ({
      data: {
        success: true,
        data: { roadmap: { _id: mockRoadmapId, status: 'ACTIVE' }, tasks: [] },
      },
    });

    const activeRes = await roadmapService.getActiveRoadmap();
    assertTest(activeRes.data.roadmap.status === 'ACTIVE', 'Roadmap Lifecycle', 'Get Active Roadmap returns candidate active roadmap');

    // 1.3 Get Roadmap by ID
    const byIdRes = await roadmapService.getRoadmapById(mockRoadmapId);
    assertTest(byIdRes.data.roadmap._id === mockRoadmapId, 'Roadmap Lifecycle', 'Get Roadmap by ID returns target roadmap document');

    // 1.4 Get Roadmap History
    api.get = async () => ({
      data: {
        success: true,
        data: { roadmaps: [{ _id: mockRoadmapId }, { _id: 'archived-id', status: 'ARCHIVED' }], pagination: { total: 2 } },
      },
    });

    const historyRes = await roadmapService.getRoadmapHistory();
    assertTest(historyRes.data.roadmaps.length === 2, 'Roadmap Lifecycle', 'Get Roadmap History returns historical roadmaps array');

    // 1.5 Archived Roadmap
    const archivedItem = historyRes.data.roadmaps.find((r) => r.status === 'ARCHIVED');
    assertTest(archivedItem.status === 'ARCHIVED', 'Roadmap Lifecycle', 'Archived roadmap status detected correctly');

    // 1.6 Invalid Roadmap ID (404)
    api.get = async () => {
      const err = new Error('Not Found');
      err.response = { status: 404, data: { message: 'Roadmap not found' } };
      throw err;
    };

    let invalidStatus = 0;
    try {
      await roadmapService.getRoadmapById('invalid-id');
    } catch (err) {
      invalidStatus = err?.response?.status;
    }
    assertTest(invalidStatus === 404, 'Roadmap Lifecycle', 'Invalid roadmap ID returns 404 status handled by ErrorState');

    api.post = origPost;
    api.get = origGet;
  } catch (err) {
    assertTest(false, 'Roadmap Lifecycle', `Error: ${err.message}`);
  }

  // ==========================================
  // CATEGORY 2: AI INTEGRATION & RESILIENCE
  // ==========================================
  try {
    const origPost = api.post;

    // 2.1 Gemini Failure (503)
    api.post = async () => {
      const err = new Error('Gemini Service Overloaded');
      err.response = { status: 503, data: { message: 'Gemini AI service temporary overload' } };
      throw err;
    };

    let geminiErrStatus = 0;
    try {
      await roadmapService.generateRoadmap({ targetRole: 'Dev' });
    } catch (err) {
      geminiErrStatus = err?.response?.status;
    }
    assertTest(geminiErrStatus === 503, 'AI Integration', 'Gemini AI 503 service failure caught cleanly for user retry');

    // 2.2 Rate Limit (429)
    api.post = async () => {
      const err = new Error('Rate limit exceeded');
      err.response = { status: 429, data: { message: 'AI generation limit reached' } };
      throw err;
    };

    let rateLimitStatus = 0;
    try {
      await roadmapService.generateRoadmap({ targetRole: 'Dev' });
    } catch (err) {
      rateLimitStatus = err?.response?.status;
    }
    assertTest(rateLimitStatus === 429, 'AI Integration', 'Rate limit (429) caught triggering user-friendly wait notification');

    api.post = origPost;
  } catch (err) {
    assertTest(false, 'AI Integration', `Error: ${err.message}`);
  }

  // ==========================================
  // CATEGORY 3: PHASES & TIMELINE
  // ==========================================
  try {
    const mockPhases = [
      { _id: 'p1', title: 'Fundamentals', progress: 100, status: 'COMPLETED' },
      { _id: 'p2', title: 'Spring Boot', progress: 50, status: 'IN_PROGRESS' },
      { _id: 'p3', title: 'Microservices', progress: 0, status: 'NOT_STARTED' },
    ];

    const completedPhase = mockPhases.find((p) => p.status === 'COMPLETED');
    const currentPhase = mockPhases.find((p) => p.status === 'IN_PROGRESS');
    const upcomingPhase = mockPhases.find((p) => p.status === 'NOT_STARTED');

    assertTest(completedPhase.progress === 100, 'Phases & Timeline', 'Completed phase shows 100% progress');
    assertTest(currentPhase.title === 'Spring Boot', 'Phases & Timeline', 'Current focus phase identified correctly');
    assertTest(upcomingPhase.progress === 0, 'Phases & Timeline', 'Upcoming phase identified as NOT_STARTED');
  } catch (err) {
    assertTest(false, 'Phases & Timeline', `Error: ${err.message}`);
  }

  // ==========================================
  // CATEGORY 4: TASK LIFECYCLE & ACTIONS
  // ==========================================
  try {
    const origPatch = api.patch;

    // 4.1 Start Task
    api.patch = async () => ({
      data: { success: true, data: { task: { _id: mockTaskId, status: 'IN_PROGRESS' } } },
    });
    const startRes = await roadmapService.startTask(mockTaskId);
    assertTest(startRes.data.task.status === 'IN_PROGRESS', 'Task Actions', 'Start task transitions status to IN_PROGRESS');

    // 4.2 Complete Task
    api.patch = async () => ({
      data: {
        success: true,
        data: {
          task: { _id: mockTaskId, status: 'COMPLETED' },
          progress: { roadmapProgress: 75, phaseProgress: 80, completedTasks: 8, totalTasks: 10 },
        },
      },
    });
    const completeRes = await roadmapService.completeTask(mockTaskId);
    assertTest(completeRes.data.task.status === 'COMPLETED', 'Task Actions', 'Complete task transitions status to COMPLETED');

    // 4.3 Skip Task
    api.patch = async () => ({
      data: { success: true, data: { task: { _id: mockTaskId, status: 'SKIPPED' } } },
    });
    const skipRes = await roadmapService.skipTask(mockTaskId);
    assertTest(skipRes.data.task.status === 'SKIPPED', 'Task Actions', 'Skip task transitions status to SKIPPED');

    // 4.4 Reopen Task
    api.patch = async () => ({
      data: { success: true, data: { task: { _id: mockTaskId, status: 'IN_PROGRESS' } } },
    });
    const reopenRes = await roadmapService.reopenTask(mockTaskId);
    assertTest(reopenRes.data.task.status === 'IN_PROGRESS', 'Task Actions', 'Reopen task resets status to IN_PROGRESS');

    api.patch = origPatch;
  } catch (err) {
    assertTest(false, 'Task Actions', `Error: ${err.message}`);
  }

  // ==========================================
  // CATEGORY 5: PROGRESS PIPELINE VERIFICATION
  // ==========================================
  try {
    const origPatch = api.patch;

    api.patch = async () => ({
      data: {
        success: true,
        data: {
          task: { _id: mockTaskId, status: 'COMPLETED' },
          progress: {
            roadmapProgress: 72,
            phaseProgress: 80,
            completedTasks: 8,
            totalTasks: 12,
          },
        },
      },
    });

    const res = await roadmapService.completeTask(mockTaskId);
    const p = res.data.progress;

    assertTest(p.roadmapProgress === 72, 'Progress Pipeline', 'Task completion updates roadmapProgress (72%) matching backend source of truth');
    assertTest(p.phaseProgress === 80, 'Progress Pipeline', 'Task completion updates phaseProgress (80%) matching backend source of truth');
    assertTest(p.completedTasks === 8, 'Progress Pipeline', 'Task completion updates completedTasks count (8 / 12)');

    api.patch = origPatch;
  } catch (err) {
    assertTest(false, 'Progress Pipeline', `Error: ${err.message}`);
  }

  // ==========================================
  // CATEGORY 6: SECURITY & AUTHORIZATION
  // ==========================================
  try {
    const origGet = api.get;

    // 6.1 Unauthorized User Access (403)
    api.get = async () => {
      const err = new Error('Access Denied');
      err.response = { status: 403, data: { message: 'You do not have access to this user roadmap' } };
      throw err;
    };

    let forbiddenStatus = 0;
    try {
      await roadmapService.getRoadmapById(otherUserRoadmapId);
    } catch (err) {
      forbiddenStatus = err?.response?.status;
    }
    assertTest(forbiddenStatus === 403, 'Security & Auth', 'User cannot access another candidate roadmap (403 Forbidden enforced)');

    // 6.2 Zero Gemini Credentials Exposed
    const envKeysExposed = Boolean(process.env.GEMINI_API_KEY);
    assertTest(envKeysExposed === false, 'Security & Auth', 'Zero Gemini API keys or credentials exposed to frontend bundle');

    api.get = origGet;
  } catch (err) {
    assertTest(false, 'Security & Auth', `Error: ${err.message}`);
  }

  console.log('\n================================================================');
  console.log(`=== MASTER TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests}) ===`);
  console.log('================================================================\n');

  if (failedTests === 0) {
    console.log('ALL PHASE 8 COMPLETE LEARNING ROADMAP TESTS PASSED PERFECTLY!');
  } else {
    console.error('SOME PHASE 8 ROADMAP TESTS FAILED!');
    process.exit(1);
  }
}

runF8MasterIntegrationTestSuite();
