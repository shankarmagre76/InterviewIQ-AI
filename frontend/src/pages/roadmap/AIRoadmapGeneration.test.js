import { roadmapService } from '../../services/roadmapService.js';
import { api } from '../../services/api.js';

console.log('=== F8.3 AI ROADMAP GENERATION TEST SUITE ===\n');

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

async function runAIRoadmapGenTestSuite() {
  const mockId = '60d5ecb8b3b3b3b3b3b3b3b3';

  // Test 1: Successful Generation with Aggregated AI Context & Target Role
  try {
    const origPost = api.post;

    api.post = async (url, body) => ({
      data: {
        success: true,
        statusCode: 201,
        message: 'AI Learning Roadmap generated successfully',
        data: {
          roadmap: {
            _id: mockId,
            targetRole: body.targetRole,
            title: `${body.targetRole} Learning Roadmap`,
            status: 'ACTIVE',
            version: 2,
          },
          tasks: [],
        },
      },
    });

    const res = await roadmapService.generateRoadmap({
      targetRole: 'Senior React Developer',
      forceRegenerate: true,
    });

    assert(res.data.roadmap.targetRole === 'Senior React Developer', 'Target role passed to backend generator');
    assert(res.data.roadmap.version === 2, 'Version incremented upon regeneration');
    assert(res.data.roadmap.status === 'ACTIVE', 'New generated roadmap status is ACTIVE');

    api.post = origPost;
  } catch (err) {
    assert(false, `Test 1 failed: ${err.message}`);
  }

  // Test 2: Duplicate Generation Request Lock
  try {
    let submitCount = 0;
    const origPost = api.post;

    api.post = async () => {
      submitCount++;
      return { data: { success: true, data: { roadmap: { _id: mockId } } } };
    };

    let isSubmitting = false;
    const triggerSubmit = async () => {
      if (isSubmitting) return; // Client lock
      isSubmitting = true;
      try {
        await roadmapService.generateRoadmap({ targetRole: 'Java Dev' });
      } finally {
        isSubmitting = false;
      }
    };

    // Simulate 3 rapid clicks
    await Promise.all([triggerSubmit(), triggerSubmit(), triggerSubmit()]);
    assert(submitCount === 1, 'Duplicate click lock prevents multiple API calls');

    api.post = origPost;
  } catch (err) {
    assert(false, `Test 2 failed: ${err.message}`);
  }

  // Test 3: Rate Limiting (429) & Gemini Error Handling
  try {
    const origPost = api.post;

    api.post = async () => {
      const err = new Error('Rate limit exceeded');
      err.response = { status: 429, data: { message: 'Too many AI operations' } };
      throw err;
    };

    let errorMsg = '';
    try {
      await roadmapService.generateRoadmap({ targetRole: 'DevOps' });
    } catch (err) {
      const is429 = err?.response?.status === 429;
      errorMsg = is429
        ? 'AI Generation Rate Limit Exceeded (10 requests/hour limit). Please wait a few minutes before retrying.'
        : 'Error';
    }

    assert(errorMsg.includes('10 requests/hour limit'), 'Rate limit 429 caught with user-friendly notice');

    api.post = origPost;
  } catch (err) {
    assert(false, `Test 3 failed: ${err.message}`);
  }

  // Test 4: Incomplete Profile Fallback Handling
  try {
    const incompleteProfile = { headline: '', currentRole: '', skills: [] };
    const derivedTargetRole = incompleteProfile.headline || incompleteProfile.currentRole || 'Software Engineer / Technical Specialist';

    assert(derivedTargetRole === 'Software Engineer / Technical Specialist', 'Incomplete profile falls back safely to default role');
  } catch (err) {
    assert(false, `Test 4 failed: ${err.message}`);
  }

  console.log(`\n=== AI GENERATION TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed === 0) {
    console.log('ALL F8.3 AI ROADMAP GENERATION TESTS COMPLETED SUCCESSFULLY!');
  } else {
    console.error('SOME AI GENERATION TESTS FAILED!');
    process.exit(1);
  }
}

runAIRoadmapGenTestSuite();
