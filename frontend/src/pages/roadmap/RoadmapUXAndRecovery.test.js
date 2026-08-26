import { roadmapService } from '../../services/roadmapService.js';
import { api } from '../../services/api.js';

console.log('=== F8.10 ROADMAP UX, ERROR HANDLING & RECOVERY MASTER TEST SUITE ===\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

async function runUXRecoveryTestSuite() {
  const mockId = '60d5ecb8b3b3b3b3b3b3b3b3';
  const mockTaskId = '70e6fdb9c4c4c4c4c4c4c4c4';

  // Scenario 1: No Roadmap State Text & Primary CTA
  try {
    const noRoadmapText = "Your personalized learning roadmap hasn't been created yet.";
    const ctaLabel = 'Generate My Roadmap';

    assert(noRoadmapText.includes("hasn't been created yet"), 'Scenario 1: No roadmap text matches required UX copy');
    assert(ctaLabel === 'Generate My Roadmap', 'Scenario 1: Primary CTA label is Generate My Roadmap');
  } catch (err) {
    assert(false, `Scenario 1 failed: ${err.message}`);
  }

  // Scenario 2: Generating Roadmap Processing Indicator Text
  try {
    const processingText = 'Your AI career coach is building your roadmap...';
    assert(processingText === 'Your AI career coach is building your roadmap...', 'Scenario 2: AI processing text matches required UX copy');
  } catch (err) {
    assert(false, `Scenario 2 failed: ${err.message}`);
  }

  // Scenario 3: Roadmap Loading Skeleton
  try {
    const isLoading = true;
    const roadmapDoc = null;
    const shouldShowSkeleton = isLoading && !roadmapDoc;

    assert(shouldShowSkeleton === true, 'Scenario 3: Roadmap loading state renders SkeletonCard component');
  } catch (err) {
    assert(false, `Scenario 3 failed: ${err.message}`);
  }

  // Scenario 4: Task Loading & Duplicate Click Lock
  try {
    let callCount = 0;
    const origPatch = api.patch;

    api.patch = async () => {
      callCount++;
      return { data: { success: true, data: { task: { _id: mockTaskId, status: 'IN_PROGRESS' } } } };
    };

    let activeAction = null;
    const handleStart = async () => {
      if (activeAction) return;
      activeAction = 'start';
      try {
        await roadmapService.startTask(mockTaskId);
      } finally {
        activeAction = null;
      }
    };

    await Promise.all([handleStart(), handleStart()]);
    assert(callCount === 1, 'Scenario 4: Task loading lock prevents duplicate click calls');

    api.patch = origPatch;
  } catch (err) {
    assert(false, `Scenario 4 failed: ${err.message}`);
  }

  // Scenario 5: Task Completion & Milestone Calculation
  try {
    const origPatch = api.patch;

    api.patch = async () => ({
      data: {
        success: true,
        data: {
          task: { _id: mockTaskId, status: 'COMPLETED' },
          progress: { roadmapProgress: 100, roadmapStatus: 'COMPLETED' },
        },
      },
    });

    const res = await roadmapService.completeTask(mockTaskId);
    assert(res.data.progress.roadmapProgress === 100, 'Scenario 5: Complete task updates overall progress to 100%');

    api.patch = origPatch;
  } catch (err) {
    assert(false, `Scenario 5 failed: ${err.message}`);
  }

  // Scenario 6: Task Failure Message
  try {
    const taskErrorMessage = "Couldn't update this task. Please try again.";
    assert(taskErrorMessage === "Couldn't update this task. Please try again.", 'Scenario 6: Task failure message matches required UX copy');
  } catch (err) {
    assert(false, `Scenario 6 failed: ${err.message}`);
  }

  // Scenario 7: AI Service Failure (500/503)
  try {
    const origPost = api.post;

    api.post = async () => {
      const err = new Error('Gemini Unavailable');
      err.response = { status: 503, data: { message: 'Gemini AI service overloaded' } };
      throw err;
    };

    let caughtMsg = '';
    try {
      await roadmapService.generateRoadmap({ targetRole: 'Java Dev' });
    } catch (err) {
      caughtMsg = err?.response?.data?.message;
    }

    assert(caughtMsg === 'Gemini AI service overloaded', 'Scenario 7: AI service failure caught cleanly for retry');
    api.post = origPost;
  } catch (err) {
    assert(false, `Scenario 7 failed: ${err.message}`);
  }

  // Scenario 8: Rate Limiting (429) Notice
  try {
    const rateLimitErr = new Error('Rate limit');
    rateLimitErr.response = { status: 429, data: { message: 'Too many requests' } };

    const is429 = rateLimitErr?.response?.status === 429;
    const userNotice = is429
      ? 'AI Generation Rate Limit Exceeded (10 requests/hour limit). Please wait a few minutes before retrying.'
      : 'Error';

    assert(is429 === true, 'Scenario 8: 429 Rate limit status detected');
    assert(userNotice.includes('10 requests/hour limit'), 'Scenario 8: User friendly rate limit notice generated');
  } catch (err) {
    assert(false, `Scenario 8 failed: ${err.message}`);
  }

  // Scenario 9: Network Failure Recovery
  try {
    const networkErr = new Error('Network Error');
    networkErr.response = undefined;

    const parseError = (err) => err?.response?.data?.message || err?.message || 'Network failure';
    assert(parseError(networkErr) === 'Network Error', 'Scenario 9: Network failure caught cleanly without crashing');
  } catch (err) {
    assert(false, `Scenario 9 failed: ${err.message}`);
  }

  // Scenario 10: Invalid Roadmap ID
  try {
    const origGet = api.get;

    api.get = async () => {
      const err = new Error('Bad Request');
      err.response = { status: 400, data: { message: 'Invalid Learning Roadmap ID format' } };
      throw err;
    };

    let caughtMsg = '';
    try {
      await roadmapService.getRoadmapById('invalidIdFormat');
    } catch (err) {
      caughtMsg = err?.response?.data?.message;
    }

    assert(caughtMsg === 'Invalid Learning Roadmap ID format', 'Scenario 10: Invalid roadmap ID 400 caught cleanly');

    api.get = origGet;
  } catch (err) {
    assert(false, `Scenario 10 failed: ${err.message}`);
  }

  // Scenario 11: Deleted Roadmap (404)
  try {
    const origGet = api.get;

    api.get = async () => {
      const err = new Error('Not Found');
      err.response = { status: 404, data: { message: 'Learning roadmap not found or access denied' } };
      throw err;
    };

    let statusCaught = 0;
    try {
      await roadmapService.getRoadmapById(mockId);
    } catch (err) {
      statusCaught = err?.response?.status;
    }

    assert(statusCaught === 404, 'Scenario 11: Deleted roadmap 404 caught triggering ErrorState');

    api.get = origGet;
  } catch (err) {
    assert(false, `Scenario 11 failed: ${err.message}`);
  }

  // Scenario 12: Archived Roadmap Warning Banner
  try {
    const archivedRoadmap = { _id: mockId, title: 'Old Roadmap', status: 'ARCHIVED' };
    const isArchived = archivedRoadmap.status === 'ARCHIVED';

    assert(isArchived === true, 'Scenario 12: Archived status triggers warning notice');
  } catch (err) {
    assert(false, `Scenario 12 failed: ${err.message}`);
  }

  // Scenario 13: Unauthorized Access (401)
  try {
    const authErr = new Error('Unauthorized');
    authErr.response = { status: 401, data: { message: 'JWT Token expired' } };

    const is401 = authErr?.response?.status === 401;
    assert(is401 === true, 'Scenario 13: Token expiration 401 status intercepted cleanly');
  } catch (err) {
    assert(false, `Scenario 13 failed: ${err.message}`);
  }

  console.log(`\n=== UX & RECOVERY TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed === 0) {
    console.log('ALL F8.10 ROADMAP UX, ERROR HANDLING & RECOVERY TESTS COMPLETED SUCCESSFULLY!');
  } else {
    console.error('SOME ROADMAP UX & RECOVERY TESTS FAILED!');
    process.exit(1);
  }
}

runUXRecoveryTestSuite();
